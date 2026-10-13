
"use client";

import Link from "next/link";
import { STATUS_LABELS, STATUS_CLASSES, CONTENT_TYPES } from "../../../../lib/mock-data";
import { ChevronRight, History, RefreshCw, CheckCircle2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

import type { ContentItem, ReviewDecision } from "../../../../lib/models";
import { contentData, orderData } from "../../../../lib/data";

export default function ContentDetail({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [order, setOrder] = useState<ContentItem | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");

  function reviewOrder(status: ReviewDecision) {
    if (!order || order.status !== "review") return;
    if (status === "revision" && !revisionNote.trim()) {
      alert("Please enter a revision note.");
      return;
    }
    const updated = { ...order, status, ...(status === "revision" ? { revisionNote: revisionNote.trim() } : {}) };
    try {
      if (status === "approved") contentData.approve(updated);
      else orderData.update(updated);
      setOrder(updated);
    } catch {
      alert("Could not save the review. Please try again.");
    }
  }

  useEffect(() => {
    let active = true;
    setLoaded(false); setOrder(null); setRevisionNote("");
    params.then(({ id }) => {
      if (!active) return;
      setId(id);
      const item = contentData.get(id);
      setOrder(item);
      setRevisionNote(item?.revisionNote || "");
      setLoaded(true);
    }).catch(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [params]);

  const topic = order?.topic || "";
  const customer = order?.customerName || "";
  const type = order?.contentType || CONTENT_TYPES[0];
  const label = STATUS_LABELS[order?.status || "in-progress"] || STATUS_LABELS["in-progress"];
  const statusClass = STATUS_CLASSES[order?.status || "in-progress"] || "production";

  if (!loaded) return <><section className="page-main">Loading...</section></>;
  if (!order) return <><section className="page-main"><div className="empty-state"><h2>Content not found</h2></div></section></>;

  return (
    <>
      
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
    </>
  );
}
