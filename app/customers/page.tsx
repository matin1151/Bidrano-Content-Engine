
"use client";

import Link from "next/link";
import { CUSTOMERS as base } from "../../lib/mock-data";
import type { ReactNode } from "react";
import { ChevronLeft, CirclePlus, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState(base);
  useEffect(() => {
    const raw = localStorage.getItem("bidrano_customers");
    if (raw) { try { setCustomers([...base, ...JSON.parse(raw)]); } catch {} }
  }, []);

  return <PageShell title="Customers" subtitle="Manage each customer Brand Profile, assets and Content Memory.">
    <div className="page-actions"><Link href="/customers/new" className="button primary"><CirclePlus size={17} /> New Customer</Link></div>
    <div className="customer-grid">{customers.map((c) => <Link href={"/customers/" + c.id} className="customer-card" key={c.id}>
      <div className="customer-top"><span className="large-avatar">{c.initials}</span><span className="status-dot">{c.status}</span></div>
      <h3>{c.name}</h3><p>{c.field}</p><div className="customer-footer"><span>View Brand Profile</span><ChevronLeft size={15} /></div>
    </Link>)}</div>
  </PageShell>;
}

function PageShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return <main className="page-shell"><aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link><Link href="/customers" className="mini-active"><Users size={19} /></Link></aside><section className="page-main"><div className="page-header"><div><span className="eyebrow">CUSTOMERS</span><h1>{title}</h1><p>{subtitle}</p></div><Link href="/" className="back-link">Dashboard <ChevronLeft size={15} /></Link></div>{children}</section></main>;
}
