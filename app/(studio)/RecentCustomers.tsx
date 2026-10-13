"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Customer } from "../../lib/models";
import { customerData } from "../../lib/data";
import { requestMessage } from "../../lib/api-client";

export default function RecentCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    customerData.list(controller.signal).then((items) => {
      if (!controller.signal.aborted) setCustomers(items.slice(-3).reverse());
    }).catch((error) => {
      if (!controller.signal.aborted) setError(requestMessage(error));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  if (loading) return <p role="status">Loading...</p>;
  if (error) return <p role="alert">{error}</p>;
  return <>{customers.map(({ id, name, field, initials }) =>
    <Link href={"/customers/" + id} className="client-row" key={id}><span className="client-avatar">{initials}</span><span><strong>{name}</strong><small>{field}</small></span><i/></Link>
  )}</>;
}
