
"use client";

import Link from "next/link";
import { FolderKanban, Search, ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";

const items = [
  { id: "001", title: "۵ اشتباه رایج در مسواک زدن", customer: "دکتر نادری" },
  { id: "002", title: "پشت صحنه عکاسی برند", customer: "استودیو آریا" },
  { id: "003", title: "چطور عسل طبیعی را تشخیص دهیم؟", customer: "سوان هانی" },
];

export default function Memory() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => items.filter((x) => (x.title + " " + x.customer).toLowerCase().includes(query.toLowerCase())), [query]);

  return <main className="page-shell">
    <aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link><Link href="/memory" className="mini-active"><FolderKanban size={19} /></Link></aside>
    <section className="page-main">
      <div className="page-header"><div><span className="eyebrow">CONTENT MEMORY</span><h1>Content Memory</h1><p>Approved content, used topics and revision history.</p></div></div>
      <div className="memory-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search approved content..." /></div>
      <div className="memory-list">
        {filtered.map((x) => <Link href={"/content/" + x.id} className="memory-row" key={x.id}><span className="memory-index">{x.id}</span><div><strong>{x.title}</strong><small>{x.customer} • Approved</small></div><span className="status approved">Approved</span><ChevronLeft size={15} /></Link>)}
        {filtered.length === 0 && <div className="profile-card"><h2>No results</h2><p>Try another topic or customer name.</p></div>}
      </div>
    </section>
  </main>;
}
