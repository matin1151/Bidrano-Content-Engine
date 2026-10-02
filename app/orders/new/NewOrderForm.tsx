"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";

type ContentType = "carousel" | "stories" | "reels";
export type OrderMode = "generic" | "topic" | "suggestion";

export default function NewOrderForm({ mode }: { mode: OrderMode }) {
  const [type,setType] = useState<ContentType>("carousel");
  const title = mode==="topic" ? "Start from a Topic" : mode==="suggestion" ? "Today's Suggestion" : "New Content Order";
  const description = mode==="topic"
    ? "Give Bidrano your topic. The content pipeline will build the package around it."
    : mode==="suggestion"
      ? "Let Bidrano suggest a content direction from the customer's Brand Profile, Memory and current goals."
      : "Define the content request. Production starts only after you explicitly start it.";

  return (
    <main className="order-page">
      <div className="order-top"><Link href="/" className="back-link"><ChevronRight size={15}/>Dashboard</Link><span className="eyebrow">{mode==="topic"?"TOPIC ORDER":mode==="suggestion"?"SUGGESTION":"NEW ORDER"}</span></div>
      <div className="order-layout">
        <section>
          <div className="order-heading"><h1>{title}</h1><p>{description}</p></div>
          <div className="form-card">
            <Step n="01" title="Customer"><select defaultValue="naderi"><option value="naderi">Dr. Naderi — Dentistry</option><option value="aria">Aria Studio — Photography</option><option value="savan">Savan Honey — Honey Brand</option></select></Step>
            <Step n="02" title="Content Type">
              <div className="choice-grid">
                {([["carousel","Carousel Post"],["stories","Story Series"],["reels","Reels Production Pack"]] as const).map(([value,label])=>
                  <button key={value} type="button" className={`choice ${type===value?"selected":""}`} onClick={()=>setType(value)}>
                    {type===value && <span className="check"><Check size={13}/></span>}<strong>{label}</strong>
                  </button>
                )}
              </div>
            </Step>

            {mode==="topic" && <Step n="03" title="Topic"><textarea placeholder="Example: 5 common brushing mistakes that can damage your teeth"/></Step>}

            {mode==="suggestion" && <div className="production-note suggestion-note"><Sparkles size={18}/><span><strong>Bidrano will suggest the topic.</strong><small>The suggestion uses Brand Profile, Content Memory, current research and the customer&apos;s goals.</small></span></div>}

            <Step n={mode==="generic"?"03":"04"} title="Additional Instructions"><textarea placeholder="Campaign notes, occasion, product, restrictions or specific customer instructions..."/></Step>

            <div className="production-note">{mode==="topic"?<WandSparkles size={18}/>:<Sparkles size={18}/>}<span><strong>Production is manual.</strong><small>Review the order first, then click Start Production.</small></span></div>
            <Link href="/production/in-progress" className="start-production"><span>Start Production</span><ArrowLeft size={17}/></Link>
          </div>
        </section>

        <aside className="order-summary"><div className="summary-card">
          <span className="section-kicker">ORDER CONTEXT</span><h3>Dr. Naderi</h3>
          <p>Brand Profile and Content Memory will be passed into the production pipeline.</p>
          <div className="summary-line"><span>Type</span><b>{type==="carousel"?"Carousel":type==="stories"?"Stories":"Reels Pack"}</b></div>
          <div className="summary-line"><span>Flow</span><b>{mode==="topic"?"User Topic":mode==="suggestion"?"Bidrano Suggestion":"Manual Order"}</b></div>
          <div className="summary-line"><span>Status</span><b className="status review">Ready to Start</b></div>
        </div></aside>
      </div>
    </main>
  );
}

function Step({n,title,children}:{n:string;title:string;children:React.ReactNode}) {
  return <div className="form-step"><div className="step-title"><span>{n}</span><h2>{title}</h2></div>{children}</div>;
}
