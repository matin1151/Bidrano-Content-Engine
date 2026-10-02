
"use client";

import Link from "next/link";
import { ChevronRight, History, RefreshCw, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

type Order = {
  id: string; customerName: string; contentType: string; topic: string;
  instructions?: string; status: string; createdAt: string; currentStep: number; pipeline: string[];
};

export default function ContentDetail({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      const raw = localStorage.getItem("bidrano_order_" + id) || localStorage.getItem("bidrano_current_order");
      if (raw) {
        try { setOrder(JSON.parse(raw)); } catch {}
      }
    });
  }, [params]);

  const topic = order?.topic || "۵ اشتباه رایج در مسواک زدن";
  const customer = order?.customerName || "دکتر نادری";
  const type = order?.contentType || "Carousel";
  const label = order?.status === "approved" ? "Approved" : order?.status === "review" ? "Needs Review" : "In Production";

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
            <div className="card-title"><h2>Production Package</h2><span className="status review">{label}</span></div>
            <div className="detail-copy">
              <p><strong>Topic:</strong> {topic}</p>
              <p><strong>Customer:</strong> {customer}</p>
              <p><strong>Format:</strong> {type}</p>
              {order?.instructions && <p><strong>Instructions:</strong> {order.instructions}</p>}
              <div className="detail-placeholder"><CheckCircle2 size={20} /><span><strong>Pipeline package created</strong><small>Order Context → Research → Strategy & Copy → Visual → QA</small></span></div>
            </div>
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
