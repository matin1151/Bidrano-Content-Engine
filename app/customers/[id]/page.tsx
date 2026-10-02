
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const data:Record<string,{name:string;field:string;audience:string;tone:string;initials:string;location:string}> = {
 aria:{name:"استودیو آریا",field:"عکاسی و برندینگ",audience:"کسب‌وکارهای کوچک و برندهای شخصی",tone:"خلاق، حرفه‌ای، الهام‌بخش",initials:"AR",location:"تهران"},
 savan:{name:"سوان هانی",field:"عسل و محصولات طبیعی",audience:"خانواده‌ها و خریداران محصولات طبیعی",tone:"گرم، طبیعی، قابل‌اعتماد",initials:"SH",location:"ایران"}
};

export default async function CustomerById({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const c=data[id];
 if(!c) return <main className="page-shell"><section className="page-main"><h1>Customer not found</h1><Link href="/customers" className="button secondary">Back to Customers</Link></section></main>;
 return <main className="profile-page"><div className="profile-header"><div><Link href="/customers" className="back-link"><ChevronRight size={15}/> Customers</Link><div className="profile-title"><span className="large-avatar">{c.initials}</span><div><span className="eyebrow">BRAND PROFILE</span><h1>{c.name}</h1><p>{c.field} • {c.location}</p></div></div></div><div className="page-actions"><Link href={"/orders/new?customer="+id} className="button primary">Create Content</Link></div></div>
 <div className="profile-grid"><section className="profile-card wide"><div className="card-title"><h2>Brand Identity</h2><span>Saved</span></div><div className="fields"><Field l="Brand Name" v={c.name}/><Field l="Business" v={c.field}/><Field l="Main Audience" v={c.audience}/><Field l="Tone" v={c.tone}/></div></section><section className="profile-card wide"><div className="card-title"><h2>Content Context</h2><span>Active</span></div><div className="memory-box"><strong>Brand context is available to production.</strong><p>Audience, tone and customer-specific direction will be passed into new orders.</p></div></section></div></main>;
}
function Field({l,v}:{l:string;v:string}){return <div className="field"><small>{l}</small><strong>{v}</strong></div>}
