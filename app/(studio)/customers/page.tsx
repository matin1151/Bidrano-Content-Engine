
"use client";

import Link from "next/link";
import type { Customer } from "../../../lib/models";
import { requestMessage } from "../../../lib/api-client";
import { customerData } from "../../../lib/data";
import { ChevronLeft, CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    customerData.list(controller.signal).then(setCustomers).catch((error) => {
      if (!controller.signal.aborted) setError(requestMessage(error));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <section className="page-main"><div className="page-header"><div><span className="eyebrow">CUSTOMERS</span><h1>Customers</h1><p>Manage each customer Brand Profile, assets and Content Memory.</p></div><Link href="/" className="back-link">Dashboard <ChevronLeft size={15} /></Link></div>
    <div className="page-actions"><Link href="/customers/new" className="button primary"><CirclePlus size={17} /> New Customer</Link></div>
    {loading && <p role="status">Loading...</p>}
    {error && <p role="alert">{error}</p>}
    <div className="customer-grid">{customers.map((c) => <Link href={"/customers/" + c.id} className="customer-card" key={c.id}>
      <div className="customer-top"><span className="large-avatar">{c.initials}</span><span className="status-dot">{c.status}</span></div>
      <h3>{c.name}</h3><p>{c.field}</p><div className="customer-footer"><span>View Brand Profile</span><ChevronLeft size={15} /></div>
    </Link>)}</div>
  </section>;
}

