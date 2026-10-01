import Link from "next/link";
import { ArrowLeft, ChevronRight, Sparkles, WandSparkles, Images, Clapperboard, MessageCircleMore } from "lucide-react";

const config = {
  topic: { title: "Start from a Topic", type: "Topic Workflow", icon: WandSparkles, description: "Give Bidrano a subject and turn it into a structured content order." },
  suggestion: { title: "Today's Suggestion", type: "Suggestion Workflow", icon: Sparkles, description: "Review a content idea generated from Brand Profile, Memory and current goals." },
  carousel: { title: "Create Carousel", type: "Carousel", icon: Images, description: "Create a carousel post with final slide designs, caption, CTA and hashtags." },
  stories: { title: "Create Stories", type: "Story Series", icon: MessageCircleMore, description: "Create a complete story sequence with final story designs and interactions." },
  reels: { title: "Create Reels Pack", type: "Reels Production Pack", icon: Clapperboard, description: "Create a production-ready reel brief, script, storyboard and prompts." },
} as const;

type Mode = keyof typeof config;

export default async function NewContentMode({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;
  const current = config[(mode in config ? mode : "topic") as Mode];
  const Icon = current.icon;
  const isSuggestion = mode === "suggestion";

  return (
    <main className="order-page">
      <div className="order-top">
        <Link href="/" className="back-link"><ChevronRight size={15} /> Dashboard</Link>
        <span className="eyebrow">{current.type.toUpperCase()}</span>
      </div>
      <div className="order-layout">
        <section>
          <div className="order-heading">
            <div className="mode-hero-icon"><Icon size={22} /></div>
            <h1>{current.title}</h1>
            <p>{current.description}</p>
          </div>
          <div className="form-card">
            <div className="form-step">
              <div className="step-title"><span>01</span><h2>Customer</h2></div>
              <select defaultValue="naderi">
                <option value="naderi">دکتر نادری — دندانپزشکی</option>
                <option value="aria">استودیو آریا — عکاسی</option>
                <option value="savan">سوان هانی — عسل</option>
              </select>
            </div>
            {isSuggestion ? (
              <div className="form-step">
                <div className="step-title"><span>02</span><h2>Suggested Topic</h2></div>
                <div className="suggestion-box"><Sparkles size={18} /><div><strong>۳ نشانه که می‌گویند باید برای چکاپ دندان مراجعه کنید</strong><small>Generated from Brand Memory, recent topics and customer goals.</small></div></div>
              </div>
            ) : mode === "topic" ? (
              <div className="form-step">
                <div className="step-title"><span>02</span><h2>Topic</h2></div>
                <textarea placeholder="موضوع یا ایده محتوایی را وارد کن..." />
              </div>
            ) : (
              <div className="form-step">
                <div className="step-title"><span>02</span><h2>Content Brief</h2></div>
                <textarea placeholder="هدف، محصول، مناسبت یا نکات مهم محتوا..." />
              </div>
            )}
            <div className="form-step">
              <div className="step-title"><span>03</span><h2>Additional Instructions</h2></div>
              <textarea placeholder="محدودیت، CTA، لحن یا دستور خاص مشتری..." />
            </div>
            <div className="production-note"><Sparkles size={18} /><span><strong>Production is manual.</strong><small>Review the order first, then start the production pipeline.</small></span></div>
            <Link href="/production/in-progress" className="start-production"><span>Start Production</span><ArrowLeft size={17} /></Link>
          </div>
        </section>
        <aside className="order-summary">
          <div className="summary-card">
            <span className="section-kicker">ORDER CONTEXT</span>
            <h3>دکتر نادری</h3>
            <p>Brand Profile and Content Memory will be passed into the production pipeline.</p>
            <div className="summary-line"><span>Workflow</span><b>{current.type}</b></div>
            <div className="summary-line"><span>Status</span><b className="status review">Ready to Start</b></div>
          </div>
        </aside>
      </div>
    </main>
  );
}
