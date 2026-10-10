import Link from "next/link";
import Image from "next/image";
import { CUSTOMERS, CONTENT_ITEMS, PRODUCTION_SUMMARY, STATUS_LABELS, STATUS_CLASSES } from "../lib/mock-data";
import { Bell, CalendarDays, ChevronLeft, CirclePlus, FolderKanban, LayoutDashboard, Sparkles, Users, WandSparkles } from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Production", href: "/production", icon: WandSparkles },
  { label: "Content Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Content Memory", href: "/memory", icon: FolderKanban },
];

const productionStatuses = PRODUCTION_SUMMARY.map((item) => ({ number: item.count, label: STATUS_LABELS[item.status], href: "/production/" + item.status }));

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">B</div><div><strong>Bidrano</strong><small>CONTENT STUDIO</small></div></div>
        <nav className="sidebar-nav"><span className="nav-label">STUDIO</span>
          {nav.map(({label,href,icon:Icon},i)=><Link key={label} href={href} className={`nav-item ${i===0?"active":""}`}><Icon size={18}/><span>{label}</span></Link>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="smart-tip"><Sparkles size={17}/><div><strong>Smart Suggestion</strong><small>3 ideas for today</small></div></div>
          <div className="user-card"><div className="avatar">M</div><div><strong>Matin</strong><small>Studio Manager</small></div></div>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div><span className="eyebrow">BIDRANO STUDIO</span><h1>Hello Matin 👋</h1></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={18}/></button>
            <Link href="/orders/new" className="button primary"><CirclePlus size={18}/>New Content</Link>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="kicker"><Sparkles size={15}/>Content Assistant</span>
            <h2>What should we create today?</h2>
            <p>Choose a customer and a direction. Bidrano uses Brand Profile, Content Memory and current research to prepare a publish-ready content package.</p>
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
            <div className="panel-head"><div><span className="section-kicker">TODAY</span><h3>Production Status</h3></div><span className="period">This Week</span></div>
            <div className="stats">{productionStatuses.map(({number,label,href})=><Link href={href} key={label} className="stats-card"><b>{number}</b><small>{label}</small></Link>)}</div>
            <div className="progress-track"><span style={{width:"72%"}}/></div>
            <div className="progress-meta"><span>Active Orders Progress</span><b>72%</b></div>
          </div>

          <div className="panel">
            <div className="panel-head"><div><span className="section-kicker">CLIENTS</span><h3>Recent Customers</h3></div><Link href="/customers">View All<ChevronLeft size={15}/></Link></div>
            {CUSTOMERS.map(({id,name,field,initials})=>
              <Link href={"/customers/" + id} className="client-row" key={id}><span className="client-avatar">{initials}</span><span><strong>{name}</strong><small>{field}</small></span><i/></Link>
            )}
          </div>
        </section>

        <section className="section">
          <div className="section-head"><div><span className="section-kicker">CONTENT MEMORY</span><h3>Recent Content</h3></div><Link href="/memory">Full History<ChevronLeft size={15}/></Link></div>
          <div className="content-table">
            <div className="table-row table-head"><span>Customer</span><span>Type</span><span>Topic</span><span>Status</span></div>
            {CONTENT_ITEMS.map((item) => <Link key={item.id} href={"/content/" + item.id} className="table-row"><span>{item.customerName}</span><span>{item.contentType}</span><span>{item.topic}</span><b className={`status ${STATUS_CLASSES[item.status]}`}>{STATUS_LABELS[item.status]}</b></Link>)}
          </div>
        </section>
      </section>
    </main>
  );
}
