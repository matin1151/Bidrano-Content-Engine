
"use client";

import Link from "next/link";
import { NADERI_PROFILE as initial } from "../../../../../lib/mock-data";
import { requestMessage } from "../../../../../lib/api-client";
import { customerData } from "../../../../../lib/data";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";


export default function EditCustomerProfile() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    customerData.brandProfile(controller.signal).then((profile) => { setForm(profile); setLoaded(true); }).catch((error) => {
      if (!controller.signal.aborted) setError(requestMessage(error));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const update = (key:keyof typeof initial, value:string) => setForm({ ...form, [key]:value });
  async function save() {
    if (submitting.current || loading || !loaded) return;
    submitting.current = true; setSaving(true); setError("");
    try { await customerData.saveBrandProfile(form); window.location.href="/customers/dental-demo"; }
    catch (error) { setError(requestMessage(error)); }
    finally { submitting.current = false; setSaving(false); }
  }
  if (loading) return <section className="page-main"><p role="status">Loading...</p></section>;

  return <section className="profile-page"><header className="profile-header"><div><Link href="/customers/dental-demo" className="back-link"><ChevronRight size={15} /> Brand Profile</Link><div className="profile-title"><span className="large-avatar">DN</span><div><span className="eyebrow">EDIT PROFILE</span><h1>Edit Brand Profile</h1><p>Update the permanent customer context used by the content pipeline.</p></div></div></div></header>
    {error && <p role="alert">{error}</p>}
    <fieldset className="new-customer-form" disabled={saving || !loaded} style={{border:0, padding:0, margin:0, minWidth:0}}>
      <section className="profile-card"><div className="card-title"><h2>Brand Identity</h2><span>Saved</span></div><div className="fields">
        <Field label="Brand Name" value={form.brand} onChange={(v)=>update("brand",v)} /><Field label="Business / Specialty" value={form.business} onChange={(v)=>update("business",v)} /><Field label="Main Audience" value={form.audience} onChange={(v)=>update("audience",v)} /><Field label="Tone of Voice" value={form.tone} onChange={(v)=>update("tone",v)} />
      </div></section>
      <section className="profile-card"><div className="card-title"><h2>Contact & Social</h2><span>Saved</span></div><div className="fields">
        <Field label="Phone" dir="ltr" value={form.phone} onChange={(v)=>update("phone",v)} /><Field label="Address" value={form.address} onChange={(v)=>update("address",v)} /><Field label="Website" dir="ltr" value={form.website} onChange={(v)=>update("website",v)} /><Field label="Instagram" dir="ltr" value={form.instagram} onChange={(v)=>update("instagram",v)} />
      </div></section>
      <section className="profile-card"><div className="card-title"><h2>Content Rules</h2><span>Saved</span></div><textarea className="wide-input" value={form.rules} onChange={(e)=>update("rules",e.target.value)} /></section>
      <div className="form-actions"><Link href="/customers/dental-demo" className="button secondary">Cancel</Link><button type="button" onClick={save} disabled={saving || !loaded} className="button primary">{saving ? "Saving..." : "Save Changes"} <ArrowLeft size={16} /></button></div>
    </fieldset>
  </section>;
}
function Field({label,value,onChange,dir}:{label:string;value:string;onChange:(v:string)=>void;dir?:"ltr"|"rtl"}) { return <label className="field-input"><span>{label}</span><input dir={dir} value={value} onChange={(e)=>onChange(e.target.value)} /></label>; }
