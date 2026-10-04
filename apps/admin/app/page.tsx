'use client';
import { useEffect, useState } from 'react';

type Overview={users:number;openReports:number;unreadNotifications:number};
type User={id:string;email:string;displayName:string;role:string;createdAt:string};
const API=process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export default function AdminPage(){
 const [overview,setOverview]=useState<Overview|null>(null); const [users,setUsers]=useState<User[]>([]); const [error,setError]=useState('');
 const token=typeof window!=='undefined'?localStorage.getItem('access_token'):null;
 useEffect(()=>{ if(!token){setError('Sign in with an administrator account to use this console.');return;} const h={Authorization:`Bearer ${token}`}; Promise.all([fetch(`${API}/admin/overview`,{headers:h}),fetch(`${API}/admin/users`,{headers:h})]).then(async([a,b])=>{if(!a.ok||!b.ok)throw new Error('Administrator authorization failed');setOverview(await a.json());setUsers(await b.json())}).catch(e=>setError(e.message)); },[token]);
 return <div className="shell"><aside className="side"><div className="brand">Qing <span>Bible</span></div><nav><a href="#overview">Overview</a><a href="#users">Users</a><a href="#reports">Reports</a><a href="#audit">Audit Log</a></nav></aside><main className="main"><h1>Operations Console</h1><p className="muted">Restricted administration surface. Every privileged mutation should be auditable.</p>{error&&<div className="card">{error}</div>}<section id="overview" className="cards"><div className="card"><div className="muted">Users</div><div className="value">{overview?.users??'—'}</div></div><div className="card"><div className="muted">Open reports</div><div className="value">{overview?.openReports??'—'}</div></div><div className="card"><div className="muted">Unread notifications</div><div className="value">{overview?.unreadNotifications??'—'}</div></div></section><section id="users"><h2>Recent users</h2><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.displayName}</td><td>{u.email}</td><td>{u.role}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></section></main></div>
}
