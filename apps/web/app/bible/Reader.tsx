"use client";

import { useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type Verse = { reference: string; number: number; text: string };
type Chapter = { versionId: number; bookId: string; chapter: number; verses: Verse[] };
type Version = { id: number; name: string; abbreviation: string };

export default function Reader() {
  const [versionId, setVersionId] = useState(3034);
  const [versions, setVersions] = useState<Version[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [book, setBook] = useState("JHN");
  const [chapterNumber, setChapterNumber] = useState(3);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "sepia">("light");
  const [fontSize, setFontSize] = useState(20);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Array<{ reference: string; text: string }>>([]);

  useEffect(() => { fetch(`${API}/bible/versions?language=en`).then(r => r.json()).then(x => setVersions(x.data ?? x)).catch(() => {}); }, []);

  async function loadChapter() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/bible/versions/${versionId}/books/${book}/chapters/${chapterNumber}`);
      if (!res.ok) throw new Error("Unable to load chapter");
      setChapter(await res.json());
      setSelected(null);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadChapter().catch(() => setChapter(null)); }, [versionId, book, chapterNumber]);

  const className = useMemo(() => `reader reader-${theme}`, [theme]);

  async function runSearch() {
    if (search.trim().length < 2) return setResults([]);
    const res = await fetch(`${API}/search/bible?q=${encodeURIComponent(search)}&versionId=${versionId}`);
    if (res.ok) setResults((await res.json()).results ?? []);
  }

  return <main className={className}>
    <div className="reader-toolbar">
      <div><strong>Scripture</strong><span className="muted">Focused reading</span></div>
      <div className="toolbar-actions">
        <select value={versionId} onChange={e => setVersionId(Number(e.target.value))}>{versions.length ? versions.map(v => <option key={v.id} value={v.id}>{v.abbreviation} — {v.name}</option>) : <option value={3034}>BSB — Berean Standard Bible</option>}</select>
        <button onClick={() => setFontSize(x => Math.max(15, x - 1))}>A−</button><button onClick={() => setFontSize(x => Math.min(32, x + 1))}>A+</button>
        <button onClick={() => setTheme(t => t === "light" ? "sepia" : t === "sepia" ? "dark" : "light")}>Theme</button>
      </div>
    </div>

    <section className="reader-nav">
      <input value={book} onChange={e => setBook(e.target.value.toUpperCase())} aria-label="Book USFM code" placeholder="JHN" />
      <input type="number" min={1} value={chapterNumber} onChange={e => setChapterNumber(Number(e.target.value))} aria-label="Chapter" />
      <button onClick={() => setChapterNumber(x => Math.max(1, x - 1))}>Previous</button>
      <button onClick={() => setChapterNumber(x => x + 1)}>Next</button>
      <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()} placeholder="Search Scripture" />
      <button onClick={runSearch}>Search</button>
    </section>

    {results.length > 0 && <aside className="search-results"><strong>Search results</strong>{results.map(r => <button key={r.reference} onClick={() => { const m=r.reference.match(/^[A-Z0-9]+\.(\d+)\.(\d+)$/); if(m) setChapterNumber(Number(m[1])); }}>{r.reference} — {r.text}</button>)}</aside>}

    <article className="scripture-column">
      {loading && <p className="muted">Loading Scripture…</p>}
      {!loading && chapter && <><header><p className="eyebrow">{chapter.bookId} {chapter.chapter}</p><h1>{book} {chapter.chapter}</h1></header>{chapter.verses.map(v => <p key={v.number} className={`verse ${selected === v.number ? "verse-selected" : ""}`} style={{fontSize}} onClick={() => setSelected(v.number)}><sup>{v.number}</sup>{v.text}</p>)}
      {selected && <div className="verse-actions"><span>Verse {selected}</span><button>Highlight</button><button>Note</button><button>Bookmark</button><button>Share</button><button>Study with AI</button></div>}</>}
      {!loading && !chapter && <p>Configure a licensed Bible provider or choose an available version.</p>}
    </article>
  </main>;
}
