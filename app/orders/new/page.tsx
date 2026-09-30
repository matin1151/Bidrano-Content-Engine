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

export default function NewOrder() {
  const [type, setType] = useState("carousel");
  const [mode, setMode] = useState("topic");

  return (
    <main className="order-page">
      <div className="order-top">
        <Link href="/" className="back-link">
          <ChevronRight size={15} />
          داشبورد
        </Link>

        <span className="eyebrow">NEW ORDER</span>
      </div>

      <div className="order-layout">
        <section>
          <div className="order-heading">
            <h1>سفارش محتوای جدید</h1>
            <p>
              اطلاعات سفارش را مشخص کن. تولید فقط بعد از تأیید تو شروع می‌شود.
            </p>
          </div>

          <div className="form-card">
            {/* Step 01 — Customer */}
            <Step n="01" title="مشتری">
              <select defaultValue="naderi">
                <option value="naderi">
                  دکتر نادری — دندانپزشکی
                </option>
                <option value="aria">
                  استودیو آریا — عکاسی
                </option>
                <option value="savan">
                  سوان هانی — عسل
                </option>
              </select>
            </Step>

            {/* Step 02 — Content Type */}
            <Step n="02" title="نوع محتوا">
              <div className="choice-grid">
                {[
                  ["carousel", "پست کاروسل"],
                  ["stories", "رشته استوری"],
                  ["reels", "پک تولید ریلز"],
                ].map(([value, title]) => (
                  <button
                    type="button"
                    className={`choice ${
                      type === value ? "selected" : ""
                    }`}
                    onClick={() => setType(value)}
                    key={value}
                  >
                    {type === value && (
                      <span className="check">
                        <Check size={13} />
                      </span>
                    )}

                    <strong>{title}</strong>
                  </button>
                ))}
              </div>
            </Step>

            {/* Step 03 — Topic Mode */}
            <Step n="03" title="روش انتخاب موضوع">
              <div className="mode-grid">
                <button
                  type="button"
                  className={`mode ${
                    mode === "topic" ? "selected" : ""
                  }`}
                  onClick={() => setMode("topic")}
                >
                  <WandSparkles size={18} />

                  <div>
                    <strong>موضوع را می‌دهم</strong>
                    <small>
                      موضوع یا ایده مشخص دارم.
                    </small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`mode ${
                    mode === "suggest" ? "selected" : ""
                  }`}
                  onClick={() => setMode("suggest")}
                >
                  <Sparkles size={18} />

                  <div>
                    <strong>Bidrano پیشنهاد بدهد</strong>
                    <small>
                      بر اساس Brand Memory و هدف برند.
                    </small>
                  </div>
                </button>
              </div>
            </Step>

            {/* Step 04 — Topic */}
            {mode === "topic" && (
              <Step n="04" title="موضوع">
                <textarea
                  placeholder="مثلاً: ۵ اشتباه رایج در مسواک زدن که به دندان آسیب می‌زند"
                />
              </Step>
            )}

            {/* Additional Instructions */}
            <Step
              n={mode === "topic" ? "05" : "04"}
              title="توضیحات تکمیلی"
            >
              <textarea
                placeholder="نکات، مناسبت، محصول، محدودیت یا دستور خاص مشتری..."
              />
            </Step>

            {/* Production Rule */}
            <div className="production-note">
              <Sparkles size={18} />

              <span>
                <strong>شروع تولید خودکار نیست.</strong>

                <small>
                  پس از ساخت سفارش، آن را بررسی کن و دکمه «شروع تولید» را بزن.
                </small>
              </span>
            </div>

            <button type="button" className="start-production">
              <span>ایجاد سفارش و آماده‌سازی برای تولید</span>
              <ArrowLeft size={17} />
            </button>
          </div>
        </section>

        {/* Order Context */}
        <aside className="order-summary">
          <div className="summary-card">
            <span className="section-kicker">
              ORDER CONTEXT
            </span>

            <h3>دکتر نادری</h3>

            <p>
              اطلاعات Brand Profile و Memory این مشتری هنگام تولید به
              Pipeline منتقل می‌شود.
            </p>

            <div className="summary-line">
              <span>نوع</span>

              <b>
                {type === "carousel"
                  ? "کاروسل"
                  : type === "stories"
                  ? "استوری"
                  : "ریلز پک"}
              </b>
            </div>

            <div className="summary-line">
              <span>وضعیت</span>

              <b className="status review">
                آماده شروع
              </b>
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
