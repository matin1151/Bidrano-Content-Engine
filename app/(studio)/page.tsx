"use client";

import RecentCustomers from "./RecentCustomers";
import { useOrders } from "../../lib/use-orders";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTION_SUMMARY, STATUS_LABELS, STATUS_CLASSES } from "../../lib/mock-data";
import { Bell, ChevronLeft, CirclePlus, Sparkles, WandSparkles } from "lucide-react";

export default function Home() {
  const orders = useOrders();
  const activeOrders = orders.filter((order) => order.status === "in-progress");
  const steps = activeOrders.reduce((total, order) => total + order.pipeline.length, 0);
  const progress = steps ? Math.round(activeOrders.reduce((total, order) => total + order.currentStep, 0) / steps * 100) : 0;
  const productionStatuses = PRODUCTION_SUMMARY.map((item) => ({ number: String(orders.filter((order) => order.status === item.status).length).padStart(2, "0"), label: STATUS_LABELS[item.status], href: "/production/" + item.status }));
  return (
    <>
      

      <section className="main">
        <header className="topbar">
          <div><span className="eyebrow">BIDRANO STUDIO</span><h1 dir="ltr">Hello Matin 👋</h1></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications" disabled title="Notifications unavailable"><Bell size={18}/></button>
            <Link href="/orders/new" className="button primary"><CirclePlus size={18}/>New Content</Link>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="kicker"><Sparkles size={15}/>Content Assistant</span>
            <h2 dir="ltr">What should we create today?</h2>
            <p dir="ltr">Choose a customer and a direction. Bidrano uses Brand Profile, Content Memory and current research to prepare a publish-ready content package.</p>
            <div className="hero-actions">
              <Link href="/orders/new/suggestion" className="button primary large"><Sparkles size={17}/>Today&apos;s Suggestion</Link>
              <Link href="/orders/new/topic" className="button secondary large"><WandSparkles size={17}/>Start from a Topic</Link>
            </div>
          </div>
          <div className="orbit" aria-hidden="true">
            <div className="orbit-image"><Image src="/content-assistant-700.webp" width={700} height={438} sizes="390px" alt="" priority /></div>
            <span className="orbit-chip one">Brand Memory</span><span className="orbit-chip two">Research</span><span className="orbit-chip three">QA</span>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-head"><div><span className="section-kicker">TODAY</span><h3>Production Status</h3></div><span className="period">All Orders</span></div>
            <div className="stats">{productionStatuses.map(({number,label,href})=><Link href={href} key={label} className="stats-card"><b>{number}</b><small>{label}</small></Link>)}</div>
            <div className="progress-track"><span style={{width:progress + "%"}}/></div>
            <div className="progress-meta"><span>Active Orders Progress</span><b>{progress}%</b></div>
          </div>

          <div className="panel">
            <div className="panel-head"><div><span className="section-kicker">CLIENTS</span><h3>Recent Customers</h3></div><Link href="/customers">View All<ChevronLeft size={15}/></Link></div>
            <RecentCustomers />
          </div>
        </section>

        <section className="section">
          <div className="section-head"><div><span className="section-kicker">CONTENT MEMORY</span><h3>Recent Content</h3></div><Link href="/memory">Full History<ChevronLeft size={15}/></Link></div>
          <div className="content-table">
            <div className="table-row table-head"><span>Customer</span><span>Type</span><span>Topic</span><span>Status</span></div>
            {orders.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5).map((item) => <Link key={item.id} href={"/content/" + item.id} className="table-row"><span>{item.customerName}</span><span>{item.contentType}</span><span>{item.topic}</span><b className={`status ${STATUS_CLASSES[item.status]}`}>{STATUS_LABELS[item.status]}</b></Link>)}
          </div>
        </section>
      </section>
    </>
  );
}

