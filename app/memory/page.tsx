
"use client";

import Link from "next/link";
import { MEMORY_ITEMS as items, STATUS_LABELS } from "../../lib/mock-data";
import { FolderKanban, Search, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MemoryItem = { id: string; title: string; customer: string };

export default function Memory() {
  const [query, setQuery] = useState("");
  const [approvedItems, setApprovedItems] = useState<MemoryItem[]>([]);
  useEffect(() => {
    function loadMemory() {
      try {
        const saved: unknown = JSON.parse(localStorage.getItem("bidrano_content_memory") || "[]");
        if (!Array.isArray(saved)) { setApprovedItems([]); return; }
        setApprovedItems(saved.filter((item) => item?.status === "approved" && typeof item.id === "string" && typeof item.topic === "string" && typeof item.customerName === "string")
          .map((item) => ({ id: item.id, title: item.topic, customer: item.customerName })));
      } catch { setApprovedItems([]); }
    }
    loadMemory();
    window.addEventListener("storage", loadMemory);
    return () => window.removeEventListener("storage", loadMemory);
  }, []);
  const filtered = useMemo(() => [...items.filter((item) => !approvedItems.some((saved) => saved.id === item.id)), ...approvedItems].filter((x) => (x.title + " " + x.customer).toLowerCase().includes(query.toLowerCase())), [query, approvedItems]);

  return <main className="page-shell">
    <aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link><Link href="/memory" className="mini-active"><FolderKanban size={19} /></Link></aside>
    <section className="page-main">
      <div className="page-header"><div><span className="eyebrow">CONTENT MEMORY</span><h1>Content Memory</h1><p>Approved content, used topics and revision history.</p></div></div>
      <div className="memory-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search approved content..." /></div>
      <div className="memory-list">
        {filtered.map((x) => <Link href={"/content/" + x.id} className="memory-row" key={x.id}><span className="memory-index">{x.id}</span><div><strong>{x.title}</strong><small>{x.customer} • {STATUS_LABELS.approved}</small></div><span className="status approved">{STATUS_LABELS.approved}</span><ChevronLeft size={15} /></Link>)}
        {filtered.length === 0 && <div className="profile-card"><h2>No results</h2><p>Try another topic or customer name.</p></div>}
      </div>
    </section>
  </main>;
}
