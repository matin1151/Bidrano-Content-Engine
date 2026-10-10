"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

type Customer = {name:string;field:string;audience:string;tone:string;initials:string;location:string};
const data:Record<string,Customer> = {
 aria:{name:"استودیو آریا",field:"عکاسی و برندینگ",audience:"کسب‌وکارهای کوچک و برندهای شخصی",tone:"خلاق، حرفه‌ای، الهام‌بخش",initials:"AR",location:"تهران"},
 savan:{name:"سوان هانی",field:"عسل و محصولات طبیعی",audience:"خانواده‌ها و خریداران محصولات طبیعی",tone:"گرم، طبیعی، قابل‌اعتماد",initials:"SH",location:"ایران"}
};

export default function CustomerProfile({id}:{id:string}){
 const [c, setCustomer] = useState<Customer | null>(data[id] || null);
 const [loaded, setLoaded] = useState(false);
 useEffect(() => {
   let customer: Customer | null = data[id] || null;
   try {
     const saved: unknown = JSON.parse(localStorage.getItem("bidrano_customers") || "[]");
     if (!customer && Array.isArray(saved)) {
       const match = saved.find((item) => item?.id === id && typeof item.name === "string" && typeof item.field === "string");
       if (match) customer = {
         name: match.name, field: match.field,
         audience: typeof match.audience === "string" ? match.audience : "",
         tone: typeof match.tone === "string" ? match.tone : "",
         initials: typeof match.initials === "string" ? match.initials : "",
         location: typeof match.address === "string" ? match.address : "",
       };
     }
   } catch {}
   setCustomer(customer);
   setLoaded(true);
 }, [id]);
 if (!loaded && !c) return <main className="page-shell"><section className="page-main">Loading...</section></main>;
 if (!c) notFound();
 return <main className="profile-page"><div className="profile-header"><div><Link href="/customers" className="back-link"><ChevronRight size={15}/> Customers</Link><div className="profile-title"><span className="large-avatar">{c.initials}</span><div><span className="eyebrow">BRAND PROFILE</span><h1>{c.name}</h1><p>{c.field} • {c.location}</p></div></div></div><div className="page-actions"><Link href={"/orders/new?customer="+id} className="button primary">Create Content</Link></div></div>
 <div className="profile-grid"><section className="profile-card wide"><div className="card-title"><h2>Brand Identity</h2><span>Saved</span></div><div className="fields"><Field l="Brand Name" v={c.name}/><Field l="Business" v={c.field}/><Field l="Main Audience" v={c.audience}/><Field l="Tone" v={c.tone}/></div></section><section className="profile-card wide"><div className="card-title"><h2>Content Context</h2><span>Active</span></div><div className="memory-box"><strong>Brand context is available to production.</strong><p>Audience, tone and customer-specific direction will be passed into new orders.</p></div></section></div></main>;
}
function Field({l,v}:{l:string;v:string}){return <div className="field"><small>{l}</small><strong>{v}</strong></div>}
