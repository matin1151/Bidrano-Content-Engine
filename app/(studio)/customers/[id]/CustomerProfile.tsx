"use client";

import Link from "next/link";
import { CUSTOMERS } from "../../../../lib/mock-data";
import { customerData } from "../../../../lib/data";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import type { CustomerProfile as CustomerProfileData } from "../../../../lib/models";
export default function CustomerProfile({id}:{id:string}){
 const [c, setCustomer] = useState<CustomerProfileData | null>(CUSTOMERS.find((customer) => customer.id === id) || null);
 const [loaded, setLoaded] = useState(false);
 useEffect(() => {
   setCustomer(customerData.profile(id));
   setLoaded(true);
 }, [id]);
 if (!loaded && !c) return <><section className="page-main">Loading...</section></>;
 if (!c) notFound();
 return <section className="profile-page"><div className="profile-header"><div><Link href="/customers" className="back-link"><ChevronRight size={15}/> Customers</Link><div className="profile-title"><span className="large-avatar">{c.initials}</span><div><span className="eyebrow">BRAND PROFILE</span><h1>{c.name}</h1><p>{c.field} • {c.location}</p></div></div></div><div className="page-actions"><Link href={"/orders/new?customer="+id} className="button primary">Create Content</Link></div></div>
 <div className="profile-grid"><section className="profile-card wide"><div className="card-title"><h2>Brand Identity</h2><span>Saved</span></div><div className="fields"><Field l="Brand Name" v={c.name}/><Field l="Business" v={c.field}/><Field l="Main Audience" v={c.audience}/><Field l="Tone" v={c.tone}/></div></section><section className="profile-card wide"><div className="card-title"><h2>Content Context</h2><span>Active</span></div><div className="memory-box"><strong>Brand context is available to production.</strong><p>Audience, tone and customer-specific direction will be passed into new orders.</p></div></section></div></section>;
}
function Field({l,v}:{l:string;v:string}){return <div className="field"><small>{l}</small><strong>{v}</strong></div>}
