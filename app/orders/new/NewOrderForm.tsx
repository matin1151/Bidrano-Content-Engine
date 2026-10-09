"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  field: string;
};

type Suggestion = {
  id: string;
  title: string;
  description: string;
};

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: "dental-demo", name: "Dr. Naderi", field: "Dental Clinic" },
  { id: "aria", name: "Aria Studio", field: "Product Photography" },
  { id: "savan", name: "Savan Natural Honey", field: "Natural Honey" },
];

const SUGGESTIONS: Record<string, Suggestion[]> = {
  "dental-demo": [
    {
      id: "dental-demo-1",
      title: "۳ نشانه که می‌گویند وقت چکاپ دندان رسیده",
      description: "Educational carousel for dental patients.",
    },
    {
      id: "dental-demo-2",
      title: "۵ اشتباه رایج در مسواک زدن",
      description: "Practical educational content for patients.",
    },
    {
      id: "dental-demo-3",
      title: "چرا با وجود مسواک زدن هنوز دندان‌ها آسیب می‌بینند؟",
      description: "Awareness content explaining common causes.",
    },
  ],
  aria: [
    {
      id: "aria-1",
      title: "۵ اشتباه رایج در عکاسی محصول برای اینستاگرام",
      description: "Educational content for product brands.",
    },
    {
      id: "aria-2",
      title: "قبل و بعد: نورپردازی چه چیزی را تغییر می‌دهد؟",
      description: "Visual comparison content.",
    },
    {
      id: "aria-3",
      title: "چطور برای یک برند عکس حرفه‌ای برنامه‌ریزی کنیم؟",
      description: "Practical content for business owners.",
    },
  ],
  savan: [
    {
      id: "savan-1",
      title: "چطور عسل طبیعی را از نمونه‌های تقلبی تشخیص دهیم؟",
      description: "Educational content for honey buyers.",
    },
    {
      id: "savan-2",
      title: "عسل گون چه ویژگی‌هایی دارد؟",
      description: "Product education and awareness.",
    },
    {
      id: "savan-3",
      title: "از کندو تا شیشه: مسیر تولید عسل سوان",
      description: "Brand storytelling content.",
    },
  ],
};

const CONTENT_TYPES = ["Carousel", "Post", "Story", "Reel"];

function normalizeCustomerId(id: string) {
  return id === "naderi" ? "dental-demo" : id;
}

function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return DEFAULT_CUSTOMERS;

  try {
    const saved = JSON.parse(localStorage.getItem("bidrano_customers") || "[]");

    if (!Array.isArray(saved)) return DEFAULT_CUSTOMERS;

    const custom = saved
      .filter(
        (item): item is Customer =>
          Boolean(item?.id && item?.name && item?.field)
      )
      .map((item) => ({
        id: normalizeCustomerId(String(item.id)),
        name: String(item.name),
        field: String(item.field),
      }))
      .filter((item) => !DEFAULT_CUSTOMERS.some((base) => base.id === item.id));

    return [...DEFAULT_CUSTOMERS, ...custom];
  } catch {
    return DEFAULT_CUSTOMERS;
  }
}

export default function NewOrderForm() {
  const searchParams = useSearchParams();

  const requestedCustomer = normalizeCustomerId(searchParams.get("customer") || "");
  const requestedTopic = searchParams.get("topic") || "";
  const requestedType = searchParams.get("type") || "";
  const mode = searchParams.get("mode") || "manual";

  const customers = useMemo(() => loadCustomers(), []);

  const initialCustomer =
    customers.find((customer) => customer.id === requestedCustomer) || customers[0];

  const [customerId, setCustomerId] = useState(initialCustomer?.id || "");
  const [contentType, setContentType] = useState(requestedType || "Carousel");
  const [topic, setTopic] = useState(requestedTopic);
  const [instructions, setInstructions] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [saving, setSaving] = useState(false);

  const customer = customers.find((item) => item.id === customerId) || initialCustomer;
  const customerSuggestions = SUGGESTIONS[customer?.id] || SUGGESTIONS["dental-demo"];

  function chooseSuggestion(suggestion: Suggestion) {
    setSelectedSuggestion(suggestion.id);
    setTopic(suggestion.title);
  }

  function startProduction() {
    const cleanTopic = topic.trim();

    if (!customer) {
      alert("Please select a customer first.");
      return;
    }

    if (!cleanTopic) {
      alert("Please specify a topic before starting production.");
      return;
    }

    setSaving(true);

    const order = {
      id: "ORD-" + Date.now(),
      customerId: customer.id,
      customerName: customer.name,
      customerField: customer.field,
      contentType,
      topic: cleanTopic,
      instructions: instructions.trim(),
      source: mode === "suggestion" ? "Today's Suggestion" : "Manual",
      status: "in-progress",
      createdAt: new Date().toISOString(),
      pipeline: ["Order Context", "Research", "Strategy & Copy", "Visual", "QA"],
      currentStep: 0,
    };

    localStorage.setItem(`bidrano_order_${order.id}`, JSON.stringify(order));
    localStorage.setItem("bidrano_current_order", JSON.stringify(order));

    window.location.href = `/production/in-progress?order=${encodeURIComponent(order.id)}`;
  }

  return (
    <main className="page-shell">
      <section className="page-main">
        <div className="page-header">
          <div>
            <Link href="/" className="back-link">
              <ChevronRight size={15} />
              Dashboard
            </Link>

            <span className="eyebrow">NEW CONTENT ORDER</span>
            <h1>Create Content Order</h1>
            <p>
              Define the customer, content type and topic before starting the
              production pipeline.
            </p>
          </div>
        </div>

        <div className="new-order-layout">
          <section className="order-form-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ORDER CONTEXT</span>
                <h2>Content brief</h2>
              </div>
            </div>

            <div className="form-grid">
              <label className="field-input">
                <span>Customer</span>
                <select
                  value={customerId}
                  onChange={(event) => {
                    setCustomerId(event.target.value);
                    setSelectedSuggestion("");
                  }}
                >
                  {customers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.field}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-input">
                <span>Content Type</span>
                <select
                  value={contentType}
                  onChange={(event) => setContentType(event.target.value)}
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-input full">
                <span>Topic</span>
                <input
                  value={topic}
                  onChange={(event) => {
                    setTopic(event.target.value);
                    setSelectedSuggestion("");
                  }}
                  placeholder="موضوع محتوا را وارد کنید یا یکی از پیشنهادها را انتخاب کنید"
                />
                <small>
                  اگر از Today's Suggestion آمده‌ای، موضوع انتخاب‌شده اینجا
                  خودکار قرار می‌گیرد.
                </small>
              </label>

              <label className="field-input full">
                <span>Additional Instructions</span>
                <textarea
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="لحن، CTA، محدودیت‌ها یا توضیحات خاص سفارش..."
                  rows={5}
                />
              </label>
            </div>
          </section>

          <aside className="order-form-card suggestion-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">SUGGESTIONS</span>
                <h2>Today's Suggestions</h2>
              </div>
            </div>

            <p className="muted-copy">
              انتخاب یک پیشنهاد، Topic سفارش را به‌صورت خودکار پر می‌کند.
            </p>

            <div className="suggestion-list">
              {customerSuggestions.map((suggestion) => {
                const selected = selectedSuggestion === suggestion.id;

                return (
                  <button
                    type="button"
                    key={suggestion.id}
                    className={`suggestion-option ${selected ? "selected" : ""}`}
                    onClick={() => chooseSuggestion(suggestion)}
                  >
                    <span className="suggestion-check">
                      {selected ? <CheckCircle2 size={19} /> : "○"}
                    </span>

                    <span>
                      <strong>{suggestion.title}</strong>
                      <small>{suggestion.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>

        <div className="form-actions">
          <Link href="/" className="button secondary">
            Cancel
          </Link>

          <button
            type="button"
            className="button primary"
            onClick={startProduction}
            disabled={saving}
          >
            {saving ? "Starting..." : "Start Production"}
            <ArrowLeft size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}
