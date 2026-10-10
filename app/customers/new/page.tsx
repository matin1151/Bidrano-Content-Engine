"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type CustomerForm = {
  name: string;
  field: string;
  audience: string;
  tone: string;
  phone: string;
  address: string;
  website: string;
  instagram: string;
  rules: string;
};

export default function NewCustomer() {
  const [form, setForm] = useState<CustomerForm>({
    name: "",
    field: "",
    audience: "",
    tone: "",
    phone: "",
    address: "",
    website: "",
    instagram: "",
    rules: "",
  });

  const update = (key: keyof CustomerForm, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  function save() {
    if (!form.name.trim() || !form.field.trim()) {
      alert("Brand Name and Business / Specialty are required.");
      return;
    }

    const customer = {
      ...form,
      id: "customer-" + Date.now(),
      status: "Active",
      initials: form.name.trim().split(/[\s\u200c]+/u).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase(),
    };

    let old: unknown[] = [];
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("bidrano_customers") || "[]");
      if (Array.isArray(saved)) old = saved;
    } catch {}

    localStorage.setItem(
      "bidrano_customers",
      JSON.stringify([...old, customer])
    );

    window.location.href = "/customers";
  }

  return (
    <main className="profile-page">
      <div className="profile-header">
        <div>
          <Link href="/customers" className="back-link">
            <ChevronRight size={15} />
            Customers
          </Link>

          <div className="profile-title">
            <span className="large-avatar">+</span>

            <div>
              <span className="eyebrow">NEW CUSTOMER</span>
              <h1>Create Brand Profile</h1>
              <p>
                Complete the profile once; Bidrano will reuse it across future
                content.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="new-customer-form">
        <section className="profile-card">
          <div className="card-title">
            <h2>Brand Identity</h2>
            <span>Required</span>
          </div>

          <div className="fields">
            <Field
              label="Brand Name"
              placeholder="مثلاً: دکتر نادری"
              value={form.name}
              onChange={(value) => update("name", value)}
            />

            <Field
              label="Business / Specialty"
              placeholder="مثلاً: Dental Clinic"
              value={form.field}
              onChange={(value) => update("field", value)}
            />

            <Field
              label="Main Audience"
              placeholder="مخاطب اصلی برند"
              value={form.audience}
              onChange={(value) => update("audience", value)}
            />

            <Field
              label="Tone of Voice"
              placeholder="مثلاً: حرفه‌ای، صمیمی، اطمینان‌بخش"
              value={form.tone}
              onChange={(value) => update("tone", value)}
            />
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title">
            <h2>Contact & Social</h2>
            <span>Optional</span>
          </div>

          <div className="fields">
            <Field
              label="Phone"
              dir="ltr"
              placeholder="شماره تماس"
              value={form.phone}
              onChange={(value) => update("phone", value)}
            />

            <Field
              label="Address"
              placeholder="آدرس"
              value={form.address}
              onChange={(value) => update("address", value)}
            />

            <Field
              label="Website"
              dir="ltr"
              placeholder="https://"
              value={form.website}
              onChange={(value) => update("website", value)}
            />

            <Field
              label="Instagram"
              dir="ltr"
              placeholder="@username"
              value={form.instagram}
              onChange={(value) => update("instagram", value)}
            />
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title">
            <h2>Content Rules</h2>
            <span>Optional</span>
          </div>

          <textarea
            className="wide-input"
            value={form.rules}
            onChange={(event) => update("rules", event.target.value)}
            placeholder="موضوعات ممنوع، ادعاهای حساس، قوانین لحن، CTA یا دستورهای خاص مشتری..."
          />
        </section>

        <div className="form-actions">
          <Link href="/customers" className="button secondary">
            Cancel
          </Link>

          <button
            type="button"
            onClick={save}
            className="button primary"
          >
            Save Customer
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  dir,
}: {
  label: string;
  dir?: "ltr" | "rtl";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field-input">
      <span>{label}</span>

      <input
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
