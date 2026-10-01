"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type ContentType = "carousel" | "stories" | "reels";
type TopicMode = "topic" | "suggest";

export default function NewOrder() {
  const [type, setType] = useState<ContentType>("carousel");
  const [mode, setMode] = useState<TopicMode>("topic");

  return (
    <main className="order-page">
      <div className="order-top">
        <Link href="/" className="back-link">
          <ChevronRight size={15} />
          Dashboard
        </Link>

        <span className="eyebrow">NEW ORDER</span>
      </div>

      <div className="order-layout">
        <section>
          <div className="order-heading">
            <h1>New Content Order</h1>
            <p>
              Define the content request. Production starts only after you
              explicitly start it.
            </p>
          </div>

          <div className="form-card">
            <Step n="01" title="Customer">
              <select defaultValue="naderi">
                <option value="naderi">Dr. Naderi — Dentistry</option>
                <option value="aria">Aria Studio — Photography</option>
                <option value="savan">Savan Honey — Honey Brand</option>
              </select>
            </Step>

            <Step n="02" title="Content Type">
              <div className="choice-grid">
                <button
                  type="button"
                  className={`choice ${type === "carousel" ? "selected" : ""}`}
                  onClick={() => setType("carousel")}
                >
                  {type === "carousel" && (
                    <span className="check">
                      <Check size={13} />
                    </span>
                  )}
                  <strong>Carousel Post</strong>
                </button>

                <button
                  type="button"
                  className={`choice ${type === "stories" ? "selected" : ""}`}
                  onClick={() => setType("stories")}
                >
                  {type === "stories" && (
                    <span className="check">
                      <Check size={13} />
                    </span>
                  )}
                  <strong>Story Series</strong>
                </button>

                <button
                  type="button"
                  className={`choice ${type === "reels" ? "selected" : ""}`}
                  onClick={() => setType("reels")}
                >
                  {type === "reels" && (
                    <span className="check">
                      <Check size={13} />
                    </span>
                  )}
                  <strong>Reels Production Pack</strong>
                </button>
              </div>
            </Step>

            <Step n="03" title="Topic Selection">
              <div className="mode-grid">
                <button
                  type="button"
                  className={`mode ${mode === "topic" ? "selected" : ""}`}
                  onClick={() => setMode("topic")}
                >
                  <WandSparkles size={18} />
                  <div>
                    <strong>I Have a Topic</strong>
                    <small>I already have a specific topic or idea.</small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`mode ${mode === "suggest" ? "selected" : ""}`}
                  onClick={() => setMode("suggest")}
                >
                  <Sparkles size={18} />
                  <div>
                    <strong>Suggest a Topic</strong>
                    <small>
                      Based on Brand Profile, Memory and brand goals.
                    </small>
                  </div>
                </button>
              </div>
            </Step>

            {mode === "topic" && (
              <Step n="04" title="Topic">
                <textarea placeholder="Example: 5 common brushing mistakes that can damage your teeth" />
              </Step>
            )}

            <Step
              n={mode === "topic" ? "05" : "04"}
              title="Additional Instructions"
            >
              <textarea placeholder="Campaign notes, occasion, product, restrictions or specific customer instructions..." />
            </Step>

            <div className="production-note">
              <Sparkles size={18} />
              <span>
                <strong>Production is manual.</strong>
                <small>
                  Review the order first, then click Start Production.
                </small>
              </span>
            </div>

            <Link
              href="/production/in-progress"
              className="start-production"
            >
              <span>Start Production</span>
              <ArrowLeft size={17} />
            </Link>
          </div>
        </section>

        <aside className="order-summary">
          <div className="summary-card">
            <span className="section-kicker">ORDER CONTEXT</span>
            <h3>Dr. Naderi</h3>
            <p>
              Brand Profile and Content Memory will be passed into the
              production pipeline.
            </p>

            <div className="summary-line">
              <span>Type</span>
              <b>
                {type === "carousel"
                  ? "Carousel"
                  : type === "stories"
                    ? "Stories"
                    : "Reels Pack"}
              </b>
            </div>

            <div className="summary-line">
              <span>Topic Mode</span>
              <b>
                {mode === "topic" ? "User Provided" : "Bidrano Suggestion"}
              </b>
            </div>

            <div className="summary-line">
              <span>Status</span>
              <b className="status review">Ready to Start</b>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="form-step">
      <div className="step-title">
        <span>{n}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
