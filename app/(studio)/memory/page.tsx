
"use client";

import Link from "next/link";
import { STATUS_LABELS } from "../../../lib/mock-data";
import { contentData } from "../../../lib/data";
import { Search, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { MemoryItem } from "../../../lib/models";

export default function Memory() {
  const [query, setQuery] = useState("");
  const [approvedItems, setApprovedItems] = useState<MemoryItem[]>([]);
  useEffect(() => {
    function loadMemory() { setApprovedItems(contentData.memory()); }
    loadMemory();
    window.addEventListener("storage", loadMemory);
    return () => window.removeEventListener("storage", loadMemory);
  }, []);
  const filtered = useMemo(() => approvedItems.filter((x) => (x.title + " " + x.customer).toLowerCase().includes(query.toLowerCase())), [query, approvedItems]);

  return <>
    
    <section className="page-main">
      <div className="page-header"><div><span className="eyebrow">CONTENT MEMORY</span><h1>Content Memory</h1><p>Approved content, used topics and revision history.</p></div></div>
      <div className="memory-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search approved content" placeholder="Search approved content..." /></div>
      <div className="memory-list">
        {filtered.map((x) => <Link href={"/content/" + x.id} className="memory-row" key={x.id}><span className="memory-index">{x.id}</span><div><strong>{x.title}</strong><small>{x.customer} • {STATUS_LABELS.approved}</small></div><span className="status approved">{STATUS_LABELS.approved}</span><ChevronLeft size={15} /></Link>)}
        {filtered.length === 0 && <div className="profile-card"><h2>No results</h2><p>Try another topic or customer name.</p></div>}
      </div>
    </section>
  </>;
}
