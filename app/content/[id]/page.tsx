import Link from "next/link";
import { ChevronRight, History, RefreshCw } from "lucide-react";

export default async function ContentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main className="page-shell"><aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link></aside><section className="page-main">
    <div className="page-header"><div><Link href="/memory" className="back-link"><ChevronRight size={15}/> Content Memory</Link><span className="eyebrow">CONTENT DETAIL</span><h1>۵ اشتباه رایج در مسواک زدن</h1><p>دکتر نادری • Carousel • Content ID {id}</p></div><div className="page-actions"><Link href="/orders/new?mode=topic" className="button secondary"><RefreshCw size={15}/> Regenerate</Link></div></div>
    <div className="detail-grid">
      <section className="profile-card"><div className="card-title"><h2>Approved Content</h2><span className="status approved">Approved</span></div><div className="detail-copy"><p>موضوع، ساختار، اسلایدها، Caption، CTA و Hashtags نسخه تأییدشده این محتوا در این بخش قرار می‌گیرند.</p><div className="detail-placeholder">FINAL CONTENT PACKAGE</div></div></section>
      <section className="profile-card"><div className="card-title"><h2><History size={16}/> Version History</h2><span>3 versions</span></div><div className="history-list"><div><b>v3</b><span>Approved version</span><small>Today • 10:42</small></div><div><b>v2</b><span>Slide 3 revised</span><small>Today • 10:15</small></div><div><b>v1</b><span>Initial generation</span><small>Today • 09:50</small></div></div></section>
    </div>
  </section></main>
}
