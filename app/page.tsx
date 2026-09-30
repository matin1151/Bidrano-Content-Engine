import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  CirclePlus,
  FileText,
  FolderKanban,
  Images,
  LayoutDashboard,
  PlaySquare,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

const nav = [
  { label: "داشبورد", href: "/", icon: LayoutDashboard },
  { label: "مشتری‌ها", href: "/customers", icon: Users },
  { label: "تولید محتوا", href: "/production", icon: WandSparkles },
  { label: "تقویم محتوا", href: "/calendar", icon: CalendarDays },
  { label: "تاریخچه محتوا", href: "/memory", icon: FolderKanban },
];

const contentTypes = [
  { title: "پست کاروسل", sub: "طراحی اسلاید + کپشن", href: "/orders/new?type=carousel", icon: Images },
  { title: "رشته استوری", sub: "استوری‌های آماده انتشار", href: "/orders/new?type=stories", icon: FileText },
  { title: "پک تولید ریلز", sub: "سناریو + استوری‌بورد", href: "/orders/new?type=reels", icon: PlaySquare },
];

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div>
            <strong>Bidrano</strong>
            <small>CONTENT STUDIO</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-label">استودیو</span>
          {nav.map(({ label, href, icon: Icon }, index) => (
            <Link key={label} href={href} className={`nav-item ${index === 0 ? "active" : ""}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="smart-tip">
            <Sparkles size={17} />
            <div>
              <strong>پیشنهاد هوشمند</strong>
              <small>۳ ایده برای امروز</small>
            </div>
          </div>
          <div className="user-card">
            <div className="avatar">م</div>
            <div>
              <strong>متین</strong>
              <small>مدیر استودیو</small>
            </div>
          </div>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">BIDRANO STUDIO</span>
            <h1>سلام متین 👋</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="اعلان‌ها"><Bell size={18} /></button>
            <Link href="/orders/new" className="button primary">
              <CirclePlus size={18} /> سفارش جدید
            </Link>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="kicker"><Sparkles size={15} /> دستیار تولید محتوا</span>
            <h2>امروز برای کدام برند محتوا بسازیم؟</h2>
            <p>
              مشتری را انتخاب کن یا موضوعت را بنویس؛ Bidrano از Brand Memory،
              محتوای قبلی و اطلاعات روز برای ساخت خروجی آماده انتشار استفاده می‌کند.
            </p>
            <div className="hero-actions">
              <Link href="/orders/new" className="button primary large">
                <WandSparkles size={17} /> پیشنهاد محتوای امروز
              </Link>
              <Link href="/orders/new" className="button secondary large">شروع از یک موضوع</Link>
            </div>
          </div>
          <div className="orbit" aria-hidden="true">
            <div className="orbit-core"><Sparkles size={27} /></div>
            <span className="orbit-chip one">Brand Memory</span>
            <span className="orbit-chip two">Research</span>
            <span className="orbit-chip three">QA</span>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div><span className="section-kicker">CREATE</span><h3>شروع سریع</h3></div>
            <Link href="/orders/new">مشاهده همه <ChevronLeft size={15} /></Link>
          </div>
          <div className="content-types">
            {contentTypes.map(({ title, sub, href, icon: Icon }) => (
              <Link href={href} className="content-type" key={title}>
                <span className="type-icon"><Icon size={21} /></span>
                <span className="type-copy"><strong>{title}</strong><small>{sub}</small></span>
                <ChevronLeft className="arrow" size={16} />
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <div className="panel-head">
              <div><span className="section-kicker">TODAY</span><h3>وضعیت تولید</h3></div>
              <span className="period">این هفته</span>
            </div>
            <div className="stats">
              <div><b>08</b><small>در حال تولید</small></div>
              <div><b>05</b><small>منتظر بررسی</small></div>
              <div><b>21</b><small>تأیید شده</small></div>
            </div>
            <div className="progress-track"><span style={{ width: "72%" }} /></div>
            <div className="progress-meta"><span>پیشرفت سفارش‌های فعال</span><b>72%</b></div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div><span className="section-kicker">CLIENTS</span><h3>مشتری‌های اخیر</h3></div>
              <Link href="/customers">همه مشتری‌ها <ChevronLeft size={15} /></Link>
            </div>
            {[
              ["دکتر نادری", "دندانپزشکی", "DN"],
              ["استودیو آریا", "عکاسی", "AR"],
              ["سوان هانی", "عسل و محصولات طبیعی", "SH"],
            ].map(([name, field, initials]) => (
              <Link href="/customers" className="client-row" key={name}>
                <span className="client-avatar">{initials}</span>
                <span><strong>{name}</strong><small>{field}</small></span>
                <i />
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div><span className="section-kicker">CONTENT MEMORY</span><h3>آخرین محتواها</h3></div>
            <Link href="/memory">تاریخچه کامل <ChevronLeft size={15} /></Link>
          </div>
          <div className="content-table">
            <div className="table-row table-head"><span>مشتری</span><span>نوع</span><span>موضوع</span><span>وضعیت</span></div>
            <div className="table-row"><span>دکتر نادری</span><span>کاروسل</span><span>۵ اشتباه رایج در مسواک زدن</span><b className="status approved">تأیید شده</b></div>
            <div className="table-row"><span>استودیو آریا</span><span>استوری</span><span>پشت صحنه عکاسی برند</span><b className="status review">در بررسی</b></div>
            <div className="table-row"><span>سوان هانی</span><span>ریلز پک</span><span>چطور عسل طبیعی را تشخیص دهیم؟</span><b className="status production">در تولید</b></div>
          </div>
        </section>
      </section>
    </main>
  );
}
