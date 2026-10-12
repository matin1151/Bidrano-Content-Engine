"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { ApiError, requestMessage } from "../../../../lib/api-client";

import type { CustomerForm } from "../../../../lib/models";
import { customerData } from "../../../../lib/data";

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submitting = useRef(false);

  const update = (key: keyof CustomerForm, value: string) => {
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  async function save() {
    if (submitting.current) return;
    if (!form.name.trim() || !form.field.trim()) {
      alert("Brand Name and Business / Specialty are required.");
      return;
    }

    submitting.current = true; setSaving(true); setError(""); setFieldErrors({});
    try {
      await customerData.create(form);
      window.location.href = "/customers";
    } catch (error) {
      setError(requestMessage(error));
      if (error instanceof ApiError) setFieldErrors(error.fields || {});
    }
    finally { submitting.current = false; setSaving(false); }
  }

  return (
    <section className="profile-page">
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
              error={fieldErrors.name}
              onChange={(value) => update("name", value)}
            />

            <Field
              label="Business / Specialty"
              placeholder="مثلاً: Dental Clinic"
              value={form.field}
              error={fieldErrors.field}
              onChange={(value) => update("field", value)}
            />

            <Field
              label="Main Audience"
              placeholder="مخاطب اصلی برند"
              value={form.audience}
              error={fieldErrors.audience}
              onChange={(value) => update("audience", value)}
            />

            <Field
              label="Tone of Voice"
              placeholder="مثلاً: حرفه‌ای، صمیمی، اطمینان‌بخش"
              value={form.tone}
              error={fieldErrors.tone}
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
              error={fieldErrors.phone}
              onChange={(value) => update("phone", value)}
            />

            <Field
              label="Address"
              placeholder="آدرس"
              value={form.address}
              error={fieldErrors.address}
              onChange={(value) => update("address", value)}
            />

            <Field
              label="Website"
              dir="ltr"
              placeholder="https://"
              value={form.website}
              error={fieldErrors.website}
              onChange={(value) => update("website", value)}
            />

            <Field
              label="Instagram"
              dir="ltr"
              placeholder="@username"
              value={form.instagram}
              error={fieldErrors.instagram}
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
            aria-invalid={Boolean(fieldErrors.rules)}
            onChange={(event) => update("rules", event.target.value)}
            placeholder="موضوعات ممنوع، ادعاهای حساس، قوانین لحن، CTA یا دستورهای خاص مشتری..."
          />
          {fieldErrors.rules && <small role="alert">{fieldErrors.rules}</small>}
        </section>

        {error && <p role="alert">{error}</p>}
        <div className="form-actions">
          <Link href="/customers" className="button secondary">
            Cancel
          </Link>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="button primary"
          >
            {saving ? "Saving..." : "Save Customer"}
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  dir,
  error,
}: {
  label: string;
  dir?: "ltr" | "rtl";
  error?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field-input">
      <span>{label}</span>

      <input
        dir={dir}
        aria-invalid={Boolean(error)}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <small role="alert">{error}</small>}
    </label>
  );
}
