"use client";

import Link from "next/link";
import { ChevronRight, Edit3, Globe, Instagram, MapPin, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const defaults={brand:"دکتر نادری",business:"دندانپزشکی",audience:"بانوان و خانواده‌ها، ۲۵ تا ۴۵ سال",tone:"حرفه‌ای، صمیمی، اطمینان‌بخش",phone:"021-00000000",address:"تهران، منطقه ۲",website:"drnaderi.example",instagram:"@drnaderi",rules:"ادعاهای درمانی بدون منبع منتشر نشود.\nاز لحن ترساننده استفاده نشود."};

export default function CustomerProfile(){
 const [p,setP]=useState(defaults);
 useEffect(()=>{const raw=localStorage.getItem("bidrano_naderi_profile");if(raw){try{setP(JSON.parse(raw))}catch{}}},[]);
 return <main className="profile-page"><div className="profile-header"><div><Link href="/customers" className="back-link"><ChevronRight size={15}/> Customers</Link><div className="profile-title"><span className="large-avatar">DN</span><div><span className="eyebrow">BRAND PROFILE</span><h1>{p.brand}</h1><p>{p.business} • تهران</p></div></div></div><div className="page-actions"><Link href="/customers/dental-demo/edit" className="button secondary"><Edit3 size={16}/> Edit Profile</Link><Link href="/orders/new?customer=dental-demo" className="button primary">Create Content</Link></div></div>
 <div className="profile-grid"><section className="profile-card wide"><CardTitle title="Brand Identity"/><div className="fields"><Field l="Brand Name" v={p.brand}/><Field l="Business" v={p.business}/><Field l="Main Audience" v={p.audience}/><Field l="Tone" v={p.tone}/></div></section>
 <section className="profile-card"><CardTitle title="Contact Information"/><ul className="info-list"><li><Phone size={16}/> {p.phone}</li><li><MapPin size={16}/> {p.address}</li><li><Globe size={16}/> {p.website}</li><li><Instagram size={16}/> {p.instagram}</li></ul></section>
 <section className="profile-card"><CardTitle title="Content Rules"/><div className="rule"><ShieldCheck size={17}/> {p.rules.split("\n")[0]}</div><div className="rule"><ShieldCheck size={17}/> {p.rules.split("\n")[1] || "No additional rule."}</div></section>
 <section className="profile-card wide"><CardTitle title="Brand Memory"/><div className="memory-box"><strong>موضوعات تأییدشده اخیر</strong><p>بهداشت دهان • مسواک زدن • مراقبت از لثه</p><span>۳ موضوع در این حوزه‌ها قبلاً استفاده شده‌اند.</span></div></section></div></main>
}
function CardTitle({title}:{title:string}){return <div className="card-title"><h2>{title}</h2><span>Saved</span></div>}
function Field({l,v}:{l:string;v:string}){return <div className="field"><small>{l}</small><strong>{v}</strong></div>}
