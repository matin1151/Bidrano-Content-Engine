import Link from "next/link";
import { Bell, CalendarDays, ChevronLeft, CirclePlus, FolderKanban, LayoutDashboard, Sparkles, Users, WandSparkles } from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Production", href: "/production", icon: WandSparkles },
  { label: "Content Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Content Memory", href: "/memory", icon: FolderKanban },
];

const productionStatuses = [
  { number: "08", label: "In Production", href: "/production/in-progress" },
  { number: "05", label: "Waiting for Review", href: "/production/review" },
  { number: "21", label: "Approved", href: "/production/approved" },
];

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
            <div className="orbit-image"><img src="/content-assistant-700.webp" alt=""/></div>
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
            {[["Dr. Naderi","Dental Clinic","DN"],["Aria Studio","Photography","AR"],["Savan Honey","Natural Products","SH"]].map(([name,field,initials])=>
              <Link href="/customers" className="client-row" key={name}><span className="client-avatar">{initials}</span><span><strong>{name}</strong><small>{field}</small></span><i/></Link>
            )}
          </div>
        </section>

        <section className="section">
          <div className="section-head"><div><span className="section-kicker">CONTENT MEMORY</span><h3>Recent Content</h3></div><Link href="/memory">Full History<ChevronLeft size={15}/></Link></div>
          <div className="content-table">
            <div className="table-row table-head"><span>Customer</span><span>Type</span><span>Topic</span><span>Status</span></div>
            <Link href="/content/dental-brushing" className="table-row"><span>Dr. Naderi</span><span>Carousel</span><span>5 Common Toothbrushing Mistakes</span><b className="status approved">Approved</b></Link>
            <Link href="/content/aria-behind-scenes" className="table-row"><span>Aria Studio</span><span>Stories</span><span>Behind the Scenes of Brand Photography</span><b className="status review">In Review</b></Link>
            <Link href="/content/savan-natural-honey" className="table-row"><span>Savan Honey</span><span>Reels Pack</span><span>How to Identify Natural Honey</span><b className="status production">In Production</b></Link>
          </div>
        </section>
      </section>
    </main>
  );
}
