import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function EditCustomerProfile() {
  return (
    <main className="profile-page">
      <header className="profile-header">
        <div>
          <Link href="/customers/dental-demo" className="back-link">
            <ChevronRight size={15} />
            Brand Profile
          </Link>

          <div className="profile-title">
            <span className="large-avatar">DN</span>

            <div>
              <span className="eyebrow">EDIT PROFILE</span>
              <h1>Edit Brand Profile</h1>
              <p>Update the permanent customer context used by the content pipeline.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="new-customer-form">
        <section className="profile-card">
          <div className="card-title">
            <h2>Brand Identity</h2>
            <span>Saved</span>
          </div>

          <div className="fields">
            <Field label="Brand Name" value="دکتر نادری" />
            <Field label="Business / Specialty" value="دندانپزشکی" />
            <Field label="Main Audience" value="بانوان و خانواده‌ها، ۲۵ تا ۴۵ سال" />
            <Field label="Tone of Voice" value="حرفه‌ای، صمیمی، اطمینان‌بخش" />
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title">
            <h2>Contact & Social</h2>
            <span>Saved</span>
          </div>

          <div className="fields">
            <Field label="Phone" value="021-00000000" />
            <Field label="Address" value="تهران، منطقه ۲" />
            <Field label="Website" value="drnaderi.example" />
            <Field label="Instagram" value="@drnaderi" />
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title">
            <h2>Content Rules</h2>
            <span>Saved</span>
          </div>

          <textarea
            className="wide-input"
            defaultValue={"ادعاهای درمانی بدون منبع منتشر نشود.\nاز لحن ترساننده استفاده نشود."}
          />
        </section>

        <div className="form-actions">
          <Link href="/customers/dental-demo" className="button secondary">
            Cancel
          </Link>

          <Link href="/customers/dental-demo" className="button primary">
            Save Changes
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="field-input">
      <span>{label}</span>
      <input defaultValue={value} />
    </label>
  );
}
