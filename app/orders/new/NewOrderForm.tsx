
"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ContentType = "carousel" | "stories" | "reels";
export type OrderMode = "generic" | "topic" | "suggestion";

type Suggestion = { title: string; reason: string };

const profiles: Record<string, { name: string; field: string; audience: string }> = {
  naderi: { name: "دکتر نادری", field: "دندانپزشکی", audience: "بانوان و خانواده‌ها، ۲۵ تا ۴۵ سال" },
  aria: { name: "استودیو آریا", field: "عکاسی و برندینگ", audience: "کسب‌وکارهای کوچک و برندهای شخصی" },
  savan: { name: "سوان هانی", field: "عسل و محصولات طبیعی", audience: "خانواده‌ها و خریداران محصولات طبیعی" },
};

const suggestions: Record<string, Suggestion[]> = {
  naderi: [
    { title: "۳ نشانه که می‌گویند وقت چکاپ دندان رسیده", reason: "موضوع آموزشی و خدماتی مناسب برای مخاطب عمومی کلینیک." },
    { title: "۵ اشتباه رایج در مسواک زدن", reason: "موضوع آموزشی قابل تبدیل به Carousel." },
    { title: "چرا با وجود مسواک زدن هنوز دندان‌ها آسیب می‌بینند؟", reason: "پاسخ به یک سؤال رایج و مناسب برای تعامل." },
  ],
  aria: [
    { title: "۵ اشتباه رایج در عکاسی محصول برای اینستاگرام", reason: "موضوع آموزشی مرتبط با خدمات استودیو." },
    { title: "قبل و بعد: نورپردازی چه چیزی را تغییر می‌دهد؟", reason: "موضوع بصری مناسب برای نمایش توانایی استودیو." },
    { title: "چطور برای یک برند عکس حرفه‌ای برنامه‌ریزی کنیم؟", reason: "آشنایی مخاطب با فرایند حرفه‌ای تولید محتوا." },
  ],
  savan: [
    { title: "چطور عسل طبیعی را از نمونه‌های تقلبی تشخیص دهیم؟", reason: "موضوع آموزشی مرتبط با دغدغه خرید." },
    { title: "عسل گون چه ویژگی‌هایی دارد؟", reason: "معرفی محصول بدون ادعای درمانی." },
    { title: "از کندو تا شیشه: مسیر تولید عسل سوان", reason: "مناسب برای Story و Reels پشت‌صحنه." },
  ],
};

export default function NewOrderForm({ mode }: { mode: OrderMode }) {
  const [type, setType] = useState<ContentType>("carousel");
  const [customer, setCustomer] = useState("naderi");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState("");

  const profile = profiles[customer];
  const available = useMemo(() => suggestions[customer] || suggestions.naderi, [customer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("customer");
    if (c && profiles[c]) setCustomer(c);
  }, []);

  useEffect(() => {
    if (mode === "suggestion" && available[0]) {
      setSelectedSuggestion(available[0].title);
      setTopic(available[0].title);
    }
  }, [mode, available]);

  function startProduction() {
    const finalTopic = mode === "suggestion" ? selectedSuggestion : topic;
    if (!finalTopic.trim()) {
      alert("Please select or enter a topic first.");
      return;
    }

    const order = {
      id: "ORD-" + Date.now(),
      customerId: customer,
      customerName: profile.name,
      customerField: profile.field,
      contentType: type,
      topic: finalTopic,
      instructions,
      source: mode,
      status: "in-progress",
      createdAt: new Date().toISOString(),
      pipeline: ["Order Context", "Research", "Strategy & Copy", "Visual", "QA"],
      currentStep: 1,
    };

    localStorage.setItem("bidrano_current_order", JSON.stringify(order));
    localStorage.setItem("bidrano_order_" + order.id, JSON.stringify(order));
    window.location.href = "/production/in-progress?order=" + encodeURIComponent(order.id);
  }

  return (
    <main className="order-page">
      <div className="order-top">
        <Link href="/" className="back-link"><ChevronRight size={15} />Dashboard</Link>
        <span className="eyebrow">{mode === "topic" ? "TOPIC ORDER" : mode === "suggestion" ? "SUGGESTION" : "NEW ORDER"}</span>
      </div>

      <div className="order-layout">
        <section>
          <div className="order-heading">
            <h1>{mode === "topic" ? "Start from a Topic" : mode === "suggestion" ? "Today's Suggestion" : "New Content Order"}</h1>
            <p>{mode === "suggestion" ? "Choose a real content direction generated from the customer context." : "Define the request, then start the production pipeline."}</p>
          </div>

          <div className="form-card">
            <Step n="01" title="Customer">
              <select value={customer} onChange={(e) => setCustomer(e.target.value)}>
                <option value="naderi">Dr. Naderi — Dentistry</option>
                <option value="aria">Aria Studio — Photography</option>
                <option value="savan">Savan Honey — Honey Brand</option>
              </select>
            </Step>

            <Step n="02" title="Content Type">
              <div className="choice-grid">
                {([["carousel", "Carousel Post"], ["stories", "Story Series"], ["reels", "Reels Production Pack"]] as const).map(([value, label]) => (
                  <button key={value} type="button" className={"choice " + (type === value ? "selected" : "")} onClick={() => setType(value)}>
                    {type === value && <span className="check"><Check size={13} /></span>}
                    <strong>{label}</strong>
                  </button>
                ))}
              </div>
            </Step>

            {mode === "topic" && (
              <Step n="03" title="Topic">
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Example: 5 common brushing mistakes that can damage your teeth" />
              </Step>
            )}

            {mode === "suggestion" && (
              <Step n="03" title="Bidrano Suggestions">
                <div className="suggestion-list">
                  {available.map((s) => (
                    <button key={s.title} type="button" className={"suggestion-choice " + (selectedSuggestion === s.title ? "selected" : "")}
                      onClick={() => { setSelectedSuggestion(s.title); setTopic(s.title); }}>
                      <span>{selectedSuggestion === s.title ? "✓" : "○"}</span>
                      <strong>{s.title}</strong>
                      <small>{s.reason}</small>
                    </button>
                  ))}
                </div>
              </Step>
            )}

            <Step n={mode === "generic" ? "03" : "04"} title="Additional Instructions">
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Campaign notes, occasion, product, restrictions or specific customer instructions..." />
            </Step>

            <div className="production-note">
              <Sparkles size={18} />
              <span><strong>Production is ready.</strong><small>Click Start Production to create an order and enter the pipeline.</small></span>
            </div>

            <button type="button" onClick={startProduction} className="start-production">
              <span>Start Production</span><ArrowLeft size={17} />
            </button>
          </div>
        </section>

        <aside className="order-summary">
          <div className="summary-card">
            <span className="section-kicker">ORDER CONTEXT</span>
            <h3>{profile.name}</h3>
            <p>{profile.field} • {profile.audience}</p>
            <div className="summary-line"><span>Type</span><b>{type === "carousel" ? "Carousel" : type === "stories" ? "Stories" : "Reels Pack"}</b></div>
            <div className="summary-line"><span>Flow</span><b>{mode === "topic" ? "User Topic" : mode === "suggestion" ? "Bidrano Suggestion" : "Manual Order"}</b></div>
            <div className="summary-line"><span>Topic</span><b>{mode === "suggestion" ? selectedSuggestion : topic || "Not selected"}</b></div>
            <div className="summary-line"><span>Status</span><b className="status review">Ready to Start</b></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return <div className="form-step"><div className="step-title"><span>{n}</span><h2>{title}</h2></div>{children}</div>;
}
