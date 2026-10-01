"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function NewCustomer() {
  return (
    <main className="profile-page">
      <div className="profile-header">
        <div>
          <Link href="/customers" className="back-link"><ChevronRight size={15}/> Customers</Link>
          <div className="profile-title">
            <span className="large-avatar">+</span>
            <div><span className="eyebrow">NEW CUSTOMER</span><h1>Create Brand Profile</h1><p>Complete the profile once; Bidrano will reuse it across future content.</p></div>
          </div>
        </div>
      </div>

      <div className="new-customer-form">
        <section className="profile-card">
          <div className="card-title"><h2>Brand Identity</h2><span>Required</span></div>
          <div className="fields">
            <Field label="Brand Name" placeholder="مثلاً: دکتر نادری" />
            <Field label="Business / Specialty" placeholder="مثلاً: Dental Clinic" />
            <Field label="Main Audience" placeholder="مخاطب اصلی برند" />
            <Field label="Tone of Voice" placeholder="مثلاً: حرفه‌ای، صمیمی، اطمینان‌بخش" />
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title"><h2>Contact & Social</h2><span>Optional</span></div>
          <div className="fields">
            <Field label="Phone" placeholder="شماره تماس" />
            <Field label="Address" placeholder="آدرس" />
            <Field label="Website" placeholder="https://" />
            <Field label="Instagram" placeholder="@username" />
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title"><h2>Content Rules</h2><span>Optional</span></div>
          <textarea className="wide-input" placeholder="موضوعات ممنوع، ادعاهای حساس، قوانین لحن، CTA یا دستورهای خاص مشتری..." />
        </section>

        <div className="form-actions">
          <Link href="/customers" className="button secondary">Cancel</Link>
          <Link href="/customers/dental-demo" className="button primary">Save Customer <ArrowLeft size={16}/></Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return <label className="field-input"><span>{label}</span><input placeholder={placeholder} /></label>;
}
