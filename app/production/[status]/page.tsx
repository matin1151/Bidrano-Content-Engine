
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Order = {
  id: string; customerName: string; contentType: string; topic: string;
  status: string; createdAt: string; currentStep: number; pipeline: string[];
};

const fallback: Order[] = [
  { id: "001", customerName: "دکتر نادری", contentType: "Carousel", topic: "۵ اشتباه رایج در مسواک زدن", status: "review", createdAt: new Date().toISOString(), currentStep: 5, pipeline: ["Order Context","Research","Strategy & Copy","Visual","QA"] },
  { id: "002", customerName: "سوان هانی", contentType: "Stories", topic: "چطور عسل طبیعی را تشخیص دهیم؟", status: "in-progress", createdAt: new Date().toISOString(), currentStep: 2, pipeline: ["Order Context","Research","Strategy & Copy","Visual","QA"] },
  { id: "003", customerName: "استودیو آریا", contentType: "Reels Pack", topic: "پشت صحنه عکاسی برند", status: "approved", createdAt: new Date().toISOString(), currentStep: 5, pipeline: ["Order Context","Research","Strategy & Copy","Visual","QA"] },
];

export default function ProductionStatus({ params }: { params: Promise<{ status: string }> }) {
  const [status, setStatus] = useState("in-progress");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    params.then((p) => setStatus(["in-progress", "review", "approved"].includes(p.status) ? p.status : "in-progress"));
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    function readOrder() {
      const raw = localStorage.getItem("bidrano_current_order");
      if (!raw) {
        setOrders(fallback.filter((o) => o.status === status));
        return;
      }

      try {
        const order: Order = JSON.parse(raw);
        setOrders(order.status === status ? [order] : []);

        if (order.status === "in-progress" && order.currentStep < order.pipeline.length) {
          const timer = window.setTimeout(() => {
            if (cancelled) return;
            const next = { ...order, currentStep: order.currentStep + 1 };
            if (next.currentStep >= next.pipeline.length) next.status = "review";
            localStorage.setItem("bidrano_current_order", JSON.stringify(next));
            localStorage.setItem("bidrano_order_" + next.id, JSON.stringify(next));
            readOrder();
          }, 1400);
          return () => window.clearTimeout(timer);
        }
      } catch {
        setOrders(fallback.filter((o) => o.status === status));
      }
    }

    const cleanup = readOrder();
    return () => {
      cancelled = true;
      if (typeof cleanup === "function") cleanup();
    };
  }, [status]);

  const title = status === "review" ? "Needs Review" : status === "approved" ? "Approved" : "In Progress";

  return (
    <main className="page-shell">
      <aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link></aside>
      <section className="page-main">
        <header className="page-header">
          <div><Link href="/production" className="back-link"><ChevronRight size={15} /> Production</Link><span className="eyebrow">STATUS</span><h1>{title}</h1><p>Orders currently in this production state.</p></div>
        </header>

        <div className="status-detail-list">
          {orders.length === 0 && <div className="profile-card"><h2>No orders in this status</h2><p>Create a content order to start the pipeline.</p><Link href="/orders/new" className="button primary">New Content</Link></div>}
          {orders.map((o) => (
            <Link href={"/content/" + o.id} className="status-detail-row" key={o.id}>
              <span>{o.id.slice(-2).padStart(2, "0")}</span>
              <div><strong>{o.topic}</strong><small>{o.customerName} • {o.contentType} • {new Date(o.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</small></div>
              {o.status === "in-progress" ? <LoaderCircle className="spin" size={17} /> : <ChevronLeft size={17} />}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
