
"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const initial = { brand:"دکتر نادری", business:"دندانپزشکی", audience:"بانوان و خانواده‌ها، ۲۵ تا ۴۵ سال", tone:"حرفه‌ای، صمیمی، اطمینان‌بخش", phone:"021-00000000", address:"تهران، منطقه ۲", website:"drnaderi.example", instagram:"@drnaderi", rules:"ادعاهای درمانی بدون منبع منتشر نشود.\nاز لحن ترساننده استفاده نشود." };

export default function EditCustomerProfile() {
  const [form, setForm] = useState(initial);
  const update = (key:keyof typeof initial, value:string) => setForm({ ...form, [key]:value });
  function save() { localStorage.setItem("bidrano_naderi_profile", JSON.stringify(form)); window.location.href="/customers/dental-demo"; }

  return <main className="profile-page"><header className="profile-header"><div><Link href="/customers/dental-demo" className="back-link"><ChevronRight size={15} /> Brand Profile</Link><div className="profile-title"><span className="large-avatar">DN</span><div><span className="eyebrow">EDIT PROFILE</span><h1>Edit Brand Profile</h1><p>Update the permanent customer context used by the content pipeline.</p></div></div></div></header>
    <div className="new-customer-form">
      <section className="profile-card"><div className="card-title"><h2>Brand Identity</h2><span>Saved</span></div><div className="fields">
        <Field label="Brand Name" value={form.brand} onChange={(v)=>update("brand",v)} /><Field label="Business / Specialty" value={form.business} onChange={(v)=>update("business",v)} /><Field label="Main Audience" value={form.audience} onChange={(v)=>update("audience",v)} /><Field label="Tone of Voice" value={form.tone} onChange={(v)=>update("tone",v)} />
      </div></section>
      <section className="profile-card"><div className="card-title"><h2>Contact & Social</h2><span>Saved</span></div><div className="fields">
        <Field label="Phone" value={form.phone} onChange={(v)=>update("phone",v)} /><Field label="Address" value={form.address} onChange={(v)=>update("address",v)} /><Field label="Website" value={form.website} onChange={(v)=>update("website",v)} /><Field label="Instagram" value={form.instagram} onChange={(v)=>update("instagram",v)} />
      </div></section>
      <section className="profile-card"><div className="card-title"><h2>Content Rules</h2><span>Saved</span></div><textarea className="wide-input" value={form.rules} onChange={(e)=>update("rules",e.target.value)} /></section>
      <div className="form-actions"><Link href="/customers/dental-demo" className="button secondary">Cancel</Link><button type="button" onClick={save} className="button primary">Save Changes <ArrowLeft size={16} /></button></div>
    </div>
  </main>;
}
function Field({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) { return <label className="field-input"><span>{label}</span><input value={value} onChange={(e)=>onChange(e.target.value)} /></label>; }
