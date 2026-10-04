import { Worker, type Job, UnrecoverableError } from 'bullmq';
import { createDatabase, aiJobs, aiConversations, aiMessages, aiCitations, bibleVerses, devices, notifications } from '@bible-platform/database';
import { and, eq, sql } from 'drizzle-orm';
import { createServer } from 'node:http';
import { QUEUES, connection } from './queues';

const db = createDatabase(process.env.DATABASE_URL ?? '');

const MODES: Record<string,string> = { EXPLAIN:'Explain the passage plainly, distinguishing text from interpretation.', STUDY:'Provide observation, context, interpretation, and practical reflection.', COMPARE:'Compare relevant passages or ideas without presenting disputed interpretations as settled facts.', CONTEXT:'Focus on literary, historical, and immediate biblical context; flag claims needing external verification.', QUESTION:'Answer the Bible question directly, grounding textual claims in retrieved Scripture.', PRAYER:'Help formulate a Scripture-grounded prayer without claiming divine revelation or speaking as God.', APPLICATION:'Turn biblical principles into practical, non-prescriptive reflection and actions.', CROSS_REFERENCES:'Identify useful related passages and explain the connection.' };
const SYSTEM = `You are a Bible study assistant. You are not Scripture, a pastor, priest, prophet, or God. Never claim that God told you something. Never invent Bible references or quotations. Use only supplied Scripture context for textual claims. Distinguish biblical statements, historical/contextual claims, denominational interpretation, and generated reflection. When traditions disagree, say so. ${Object.values(MODES).join(' ')}`;

async function aiGenerate(system: string, input: string) {
  const key=process.env.AI_API_KEY, model=process.env.AI_MODEL;
  if(!key || !model) throw new UnrecoverableError('AI provider is not configured');
  const base=process.env.AI_BASE_URL ?? 'https://api.openai.com/v1';
  const r=await fetch(`${base}/responses`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({model,instructions:system,input,max_output_tokens:1800}),signal:AbortSignal.timeout(30000)});
  if(!r.ok) throw new Error(`AI provider error ${r.status}`);
  const p=await r.json() as any; return p.output_text?.trim() || p.output?.flatMap((x:any)=>x.content??[]).map((x:any)=>x.text??'').join(' ').trim() || (()=>{throw new Error('AI provider returned empty response')})();
}

function parseJson(raw:string){ const clean=raw.replace(/^```json\s*/i,'').replace(/```$/i,'').trim(); const v=JSON.parse(clean); if(typeof v.answer!=='string') throw new Error('Invalid AI response'); return {answer:v.answer.slice(0,20000),citations:Array.isArray(v.citations)?v.citations:[],relatedPassages:Array.isArray(v.relatedPassages)?v.relatedPassages:[],interpretationNotes:Array.isArray(v.interpretationNotes)?v.interpretationNotes:[],disclaimer:typeof v.disclaimer==='string'?v.disclaimer:undefined}; }

async function processAi(job:Job<any>){
  const {jobId,userId,input}=job.data;
  await db.db.update(aiJobs).set({status:'PROCESSING',startedAt:new Date(),error:null}).where(eq(aiJobs.id,jobId));
  try {
    const versionId=input.versionId ?? Number(process.env.DEFAULT_BIBLE_VERSION_ID ?? 3034); const filters:any[]=[sql`${bibleVerses.versionId} = ${versionId}`];
    if(input.reference?.trim()) filters.push(sql`${bibleVerses.reference} ILIKE ${input.reference.trim()}%`);
    const q=input.question.replace(/[^a-zA-Z0-9 ]/g,' ').trim(); if(q.length>=2) filters.push(sql`to_tsvector('simple', ${bibleVerses.searchText}) @@ plainto_tsquery('simple', ${q})`);
    const context=await db.db.select({versionId:bibleVerses.versionId,reference:bibleVerses.reference,text:bibleVerses.text}).from(bibleVerses).where(and(...filters)).limit(12);
    if(!context.length) throw new UnrecoverableError('No indexed Scripture context was found');
    let conversationId=input.conversationId as string|undefined;
    if(conversationId){ const [c]=await db.db.select({id:aiConversations.id}).from(aiConversations).where(and(eq(aiConversations.id,conversationId),eq(aiConversations.userId,userId))).limit(1); if(!c) throw new UnrecoverableError('AI conversation not found'); }
    if(!conversationId){ const [c]=await db.db.insert(aiConversations).values({userId,title:input.question.slice(0,100),mode:input.mode}).returning({id:aiConversations.id}); if(!c) throw new Error('Failed to create conversation'); conversationId=c.id; }
    await db.db.insert(aiMessages).values({conversationId,role:'user',content:input.question});
    const contextText=context.map(v=>`[${v.reference}] ${v.text}`).join('\n'); const raw=await aiGenerate(SYSTEM,`Mode: ${input.mode}\nQuestion: ${input.question}\n\nRetrieved Scripture context:\n${contextText}\n\nReturn JSON with keys: answer, citations, relatedPassages, interpretationNotes, disclaimer. citations must use only references in the supplied context.`);
    const parsed=parseJson(raw); const allowed=new Set(context.map(x=>`${x.versionId}:${x.reference.toUpperCase()}`)); const citations=parsed.citations.filter((c:any)=>allowed.has(`${Number(c.versionId)}:${String(c.reference).toUpperCase()}`)).map((c:any)=>({versionId:Number(c.versionId),reference:String(c.reference),quote:c.quote?String(c.quote).slice(0,500):undefined}));
    const answer={...parsed,citations,disclaimer:parsed.disclaimer ?? 'AI-generated study assistance is not a substitute for Scripture, pastoral care, or qualified theological scholarship.'};
    const [msg]=await db.db.insert(aiMessages).values({conversationId,role:'assistant',content:answer.answer,metadata:{mode:input.mode}}).returning({id:aiMessages.id});
    if(!msg) throw new Error('Failed to save AI response'); if(citations.length) await db.db.insert(aiCitations).values(citations.map((c:any)=>({messageId:msg.id,...c})));
    await db.db.update(aiConversations).set({updatedAt:new Date()}).where(eq(aiConversations.id,conversationId)); await db.db.update(aiJobs).set({status:'COMPLETED',conversationId,result:answer,completedAt:new Date()}).where(eq(aiJobs.id,jobId));
  } catch(err){ await db.db.update(aiJobs).set({status:err instanceof UnrecoverableError?'FAILED':'RETRYING',error:err instanceof Error?err.message:String(err),completedAt:err instanceof UnrecoverableError?new Date():undefined}).where(eq(aiJobs.id,jobId)); throw err; }
}

async function processNotification(job:Job<any>){
  const {userId,type,title,body,data}=job.data; const [n]=await db.db.insert(notifications).values({userId,type,title,body,data}).returning({id:notifications.id});
  const tokens=await db.db.select({pushToken:devices.pushToken}).from(devices).where(and(eq(devices.userId,userId),eq(devices.notificationsEnabled,true))); const valid=tokens.map(x=>x.pushToken).filter((x):x is string=>!!x && x.startsWith('ExponentPushToken['));
  if(!valid.length) return {notificationId:n?.id ?? null,delivered:0};
  const response=await fetch('https://exp.host/--/api/v2/push/send',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(valid.map(to=>({to,title,body,data})))});
  if(!response.ok) throw new Error(`Expo push provider returned ${response.status}`); return {notificationId:n?.id ?? null,delivered:valid.length};
}

async function processSearch(job:Job<any>){ const {versionId,bookId,chapter,verses}=job.data; for(const v of verses){ await db.db.insert(bibleVerses).values({versionId,bookId:bookId.toUpperCase(),chapter,verse:v.verse,reference:`${bookId.toUpperCase()}.${chapter}.${v.verse}`,text:v.text,searchText:v.text}).onConflictDoUpdate({target:[bibleVerses.versionId,bibleVerses.reference],set:{text:v.text,searchText:v.text,updatedAt:new Date()}}); } return {indexed:verses.length}; }
async function processAudio(job:Job<any>){ return {status:'accepted',trackId:job.data.trackId,action:job.name}; }

const defaults={attempts:4,backoff:{type:'exponential' as const,delay:1000,jitter:0.25},removeOnComplete:{count:1000},removeOnFail:{count:5000}};
const workers=[
 new Worker(QUEUES.AI,processAi,{connection,...defaults,concurrency:2}),
 new Worker(QUEUES.NOTIFICATIONS,processNotification,{connection,...defaults,concurrency:10}),
 new Worker(QUEUES.SEARCH,processSearch,{connection,...defaults,concurrency:4}),
 new Worker(QUEUES.AUDIO,processAudio,{connection,...defaults,concurrency:4}),
];
let stopping=false;
const healthServer=createServer(async (_req,res)=>{
  if (_req.url !== '/health') { res.statusCode=404; res.end('not found'); return; }
  try { await db.pool.query('SELECT 1'); res.statusCode=200; res.setHeader('content-type','application/json'); res.end(JSON.stringify({status:'ok',service:'worker',queues:workers.map(w=>w.name)})); }
  catch { res.statusCode=503; res.end(JSON.stringify({status:'down',service:'worker'})); }
});
healthServer.listen(Number(process.env.WORKER_HEALTH_PORT ?? 4010),'0.0.0.0');

workers.forEach(w=>{ w.on('failed',(job,err)=>console.error(JSON.stringify({event:'job_failed',queue:w.name,jobId:job?.id,error:err.message}))); w.on('completed',(job)=>console.info(JSON.stringify({event:'job_completed',queue:w.name,jobId:job.id}))); });
const shutdown=async()=>{ if(stopping) return; stopping=true; healthServer.close(); await Promise.all(workers.map(w=>w.close())); await db.pool.end(); process.exit(0); };
process.on('SIGTERM',shutdown); process.on('SIGINT',shutdown);
console.info(`Bible Platform worker started: ${workers.map(w=>w.name).join(', ')}`);
