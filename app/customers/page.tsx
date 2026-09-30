import Link from "next/link";
import { ChevronLeft, CirclePlus, Users } from "lucide-react";

const customers = [
  { name: "دکتر نادری", field: "دندانپزشکی", status: "فعال", initials: "DN" },
  { name: "استودیو آریا", field: "عکاسی و برندینگ", status: "فعال", initials: "AR" },
  { name: "سوان هانی", field: "عسل و محصولات طبیعی", status: "فعال", initials: "SH" },
];

export default function CustomersPage() {
  return <PageShell title="مشتری‌ها" subtitle="پروفایل برند، دارایی‌ها و Brand Memory هر مشتری را مدیریت کن.">
    <div className="page-actions"><Link href="/orders/new" className="button primary"><CirclePlus size={17}/> سفارش جدید</Link></div>
    <div className="customer-grid">
      {customers.map(c => (
        <Link href="/customers/dental-demo" className="customer-card" key={c.name}>
          <div className="customer-top"><span className="large-avatar">{c.initials}</span><span className="status-dot">{c.status}</span></div>
          <h3>{c.name}</h3><p>{c.field}</p>
          <div className="customer-footer">مشاهده Brand Profile <ChevronLeft size={15}/></div>
        </Link>
      ))}
    </div>
  </PageShell>;
}

function PageShell({children,title,subtitle}:{children:React.ReactNode,title:string,subtitle:string}) {
  return <main className="page-shell"><aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link><Link href="/customers" className="mini-active"><Users size={19}/></Link></aside><section className="page-main"><div className="page-header"><div><span className="eyebrow">CUSTOMERS</span><h1>{title}</h1><p>{subtitle}</p></div><Link href="/" className="back-link">داشبورد <ChevronLeft size={15}/></Link></div>{children}</section></main>
}

