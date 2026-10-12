
"use client";

import Link from "next/link";
import { CUSTOMERS as base } from "../../../lib/mock-data";
import { customerData } from "../../../lib/data";
import { ChevronLeft, CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState(base);
  useEffect(() => {
    setCustomers(customerData.list());
  }, []);

  return <section className="page-main"><div className="page-header"><div><span className="eyebrow">CUSTOMERS</span><h1>Customers</h1><p>Manage each customer Brand Profile, assets and Content Memory.</p></div><Link href="/" className="back-link">Dashboard <ChevronLeft size={15} /></Link></div>
    <div className="page-actions"><Link href="/customers/new" className="button primary"><CirclePlus size={17} /> New Customer</Link></div>
    <div className="customer-grid">{customers.map((c) => <Link href={"/customers/" + c.id} className="customer-card" key={c.id}>
      <div className="customer-top"><span className="large-avatar">{c.initials}</span><span className="status-dot">{c.status}</span></div>
      <h3>{c.name}</h3><p>{c.field}</p><div className="customer-footer"><span>View Brand Profile</span><ChevronLeft size={15} /></div>
    </Link>)}</div>
  </section>;
}
