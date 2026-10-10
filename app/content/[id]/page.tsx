
"use client";

import Link from "next/link";
import { CONTENT_ITEMS, STATUS_LABELS, STATUS_CLASSES, CONTENT_TYPES } from "../../../lib/mock-data";
import { ChevronRight, History, RefreshCw, CheckCircle2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

type Order = {
  id: string; customerName: string; contentType: string; topic: string;
  instructions?: string; status: string; createdAt: string; currentStep: number; pipeline: string[];
  revisionNote?: string;
};

export default function ContentDetail({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  function reviewOrder(status: "approved" | "revision") {
    if (!order || order.status !== "review") return;
    if (status === "revision" && !revisionNote.trim()) {
      alert("Please enter a revision note.");
      return;
    }
    const updated = { ...order, status, ...(status === "revision" ? { revisionNote: revisionNote.trim() } : {}) };
    try {
      const rawMemory = localStorage.getItem("bidrano_content_memory");
      let memory: Order[] = [];
      try {
        const parsed = JSON.parse(rawMemory || "[]");
        if (Array.isArray(parsed)) memory = parsed.filter((item): item is Order => Boolean(item?.id));
      } catch {}
      if (status === "approved") {
        localStorage.setItem("bidrano_content_memory", JSON.stringify([...memory.filter((item) => item.id !== updated.id), updated]));
      }
      localStorage.setItem("bidrano_order_" + updated.id, JSON.stringify(updated));
      const current = localStorage.getItem("bidrano_current_order");
      let currentId: string | undefined;
      try { currentId = JSON.parse(current || "null")?.id; } catch {}
      if (currentId === updated.id) localStorage.setItem("bidrano_current_order", JSON.stringify(updated));
      setOrder(updated);
    } catch {
      alert("Could not save the review. Please try again.");
    }
  }

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      setOrder(CONTENT_ITEMS.find((item) => item.id === id) || null);
      const raw = localStorage.getItem("bidrano_order_" + id);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Order;
          if (parsed.id === id) setOrder(parsed);
        } catch {}
      }
      setLoaded(true);
    });
  }, [params]);

  const topic = order?.topic || "";
  const customer = order?.customerName || "";
  const type = order?.contentType || CONTENT_TYPES[0];
  const label = STATUS_LABELS[order?.status || "in-progress"] || STATUS_LABELS["in-progress"];
  const statusClass = STATUS_CLASSES[order?.status || "in-progress"] || "production";

  if (!loaded) return <main className="page-shell"><section className="page-main">Loading...</section></main>;
  if (!order) return <main className="page-shell"><section className="page-main"><div className="empty-state"><h2>Content not found</h2></div></section></main>;

  return (
    <main className="page-shell">
      <aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link></aside>
      <section className="page-main">
        <div className="page-header">
          <div><Link href="/memory" className="back-link"><ChevronRight size={15} /> Content Memory</Link><span className="eyebrow">CONTENT DETAIL</span><h1>{topic}</h1><p>{customer} • {type} • Content ID {id}</p></div>
          <div className="page-actions"><Link href="/orders/new/topic" className="button secondary"><RefreshCw size={15} /> Regenerate</Link></div>
        </div>

        <div className="detail-grid">
          <section className="profile-card">
            <div className="card-title"><h2>Production Package</h2><span className={`status ${statusClass}`}>{label}</span></div>
            <div className="detail-copy">
              <p><strong>Topic:</strong> {topic}</p>
              <p><strong>Customer:</strong> {customer}</p>
              <p><strong>Format:</strong> {type}</p>
              {order?.instructions && <p><strong>Instructions:</strong> {order.instructions}</p>}
              {order.revisionNote && <p><strong>Revision note:</strong> {order.revisionNote}</p>}
              <div className="detail-placeholder"><CheckCircle2 size={20} /><span><strong>Pipeline package created</strong><small>Order Context → Research → Strategy & Copy → Visual → QA</small></span></div>
            </div>
            {order.status === "review" && <div>
              <label className="field-input"><span>Revision note</span><textarea value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} rows={3} /></label>
              <div className="form-actions">
                <button type="button" className="button primary" onClick={() => reviewOrder("approved")}><CheckCircle2 size={16} /> Approve</button>
                <button type="button" className="button secondary" onClick={() => reviewOrder("revision")}><MessageSquare size={16} /> Request revision</button>
              </div>
            </div>}
          </section>

          <section className="profile-card">
            <div className="card-title"><h2><History size={16} /> Version History</h2><span>Live</span></div>
            <div className="history-list"><div><b>v1</b><span>Initial production package</span><small>{order ? new Date(order.createdAt).toLocaleString("fa-IR") : "Demo content"}</small></div></div>
          </section>
        </div>
      </section>
    </main>
  );
}
