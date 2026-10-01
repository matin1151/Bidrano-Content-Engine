import Link from "next/link";
import { ChevronRight, Edit3, Globe, Instagram, MapPin, Phone, ShieldCheck } from "lucide-react";

export default function CustomerProfile() {
  return (
    <main className="profile-page">
      <div className="profile-header">
        <div>
          <Link href="/customers" className="back-link"><ChevronRight size={15}/> Customers</Link>
          <div className="profile-title">
            <span className="large-avatar">DN</span>
            <div><span className="eyebrow">BRAND PROFILE</span><h1>دکتر نادری</h1><p>دندانپزشکی • تهران</p></div>
          </div>
        </div>
        <div className="page-actions">
          <Link href="/customers/dental-demo/edit" className="button secondary"><Edit3 size={16}/> Edit Profile</Link>
          <Link href="/orders/new?customer=naderi" className="button primary">Create Content</Link>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-card wide"><CardTitle title="Brand Identity" /><div className="fields"><Field l="Brand Name" v="دکتر نادری" /><Field l="Business" v="دندانپزشکی" /><Field l="Main Audience" v="بانوان و خانواده‌ها، ۲۵ تا ۴۵ سال" /><Field l="Tone" v="حرفه‌ای، صمیمی، اطمینان‌بخش" /></div></section>
        <section className="profile-card"><CardTitle title="Contact Information" /><ul className="info-list"><li><Phone size={16}/> 021-00000000</li><li><MapPin size={16}/> تهران، منطقه ۲</li><li><Globe size={16}/> drnaderi.example</li><li><Instagram size={16}/> @drnaderi</li></ul></section>
        <section className="profile-card"><CardTitle title="Content Rules" /><div className="rule"><ShieldCheck size={17}/> ادعاهای درمانی بدون منبع منتشر نشود.</div><div className="rule"><ShieldCheck size={17}/> از لحن ترساننده استفاده نشود.</div></section>
        <section className="profile-card wide"><CardTitle title="Brand Memory" /><div className="memory-box"><strong>موضوعات تأییدشده اخیر</strong><p>بهداشت دهان • مسواک زدن • مراقبت از لثه</p><span>۳ موضوع در این حوزه‌ها قبلاً استفاده شده‌اند.</span></div></section>
      </div>
    </main>
  );
}
function CardTitle({title}:{title:string}){return <div className="card-title"><h2>{title}</h2><span>Saved</span></div>}
function Field({l,v}:{l:string,v:string}){return <div className="field"><small>{l}</small><strong>{v}</strong></div>}
