"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  RefreshCw,
} from "lucide-react";

type Order = {
  id: string;
  customerId?: string;
  customerName?: string;
  customerField?: string;
  contentType?: string;
  topic?: string;
  instructions?: string;
  source?: string;
  status?: string;
  createdAt?: string;
  pipeline?: string[];
  currentStep?: number;
};

const PIPELINE = [
  "Order Context",
  "Research",
  "Strategy & Copy",
  "Visual",
  "QA",
];

function readOrder(orderId?: string): Order | null {
  if (typeof window === "undefined") return null;

  try {
    if (orderId) {
      const direct = localStorage.getItem(`bidrano_order_${orderId}`);
      if (direct) return JSON.parse(direct) as Order;
    }

    const current = localStorage.getItem("bidrano_current_order");
    if (current) {
      const parsed = JSON.parse(current) as Order;
      if (!orderId || parsed.id === orderId) return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function saveOrder(order: Order) {
  localStorage.setItem(`bidrano_order_${order.id}`, JSON.stringify(order));
  localStorage.setItem("bidrano_current_order", JSON.stringify(order));
}

export default function ProductionStatus({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const [status, setStatus] = useState("in-progress");
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    params
      .then((resolved) => {
        if (!active) return;

        setStatus(resolved.status);

        const query = new URLSearchParams(window.location.search);
        const orderId = query.get("order") || undefined;
        const existing = readOrder(orderId);

        if (existing) {
          setOrder(existing);
        }

        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [params]);

  useEffect(() => {
    if (!order || order.status === "review" || order.status === "approved") {
      return;
    }

    if (order.status !== "in-progress") {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextStep = Math.min(
        (order.currentStep ?? 0) + 1,
        PIPELINE.length
      );

      const nextStatus =
        nextStep >= PIPELINE.length ? "review" : "in-progress";

      const updated: Order = {
        ...order,
        currentStep: nextStep,
        status: nextStatus,
        pipeline: PIPELINE,
      };

      saveOrder(updated);
      setOrder(updated);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [order]);

  const pageTitle = useMemo(() => {
    switch (status) {
      case "review":
      case "needs-review":
        return "Needs Review";
      case "completed":
      case "approved":
        return "Completed";
      case "revision":
        return "Revision";
      default:
        return "In Progress";
    }
  }, [status]);

  if (!loaded) {
    return (
      <main className="page-shell">
        <section className="page-main">
          <div className="empty-state">
            <Loader2 className="spin" size={24} />
            <h2>Loading production...</h2>
          </div>
        </section>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="page-shell">
        <section className="page-main">
          <div className="page-header">
            <div>
              <span className="eyebrow">PRODUCTION</span>
              <h1>{pageTitle}</h1>
              <p>Orders currently in this production state.</p>
            </div>
          </div>

          <div className="empty-state">
            <h2>No order found</h2>
            <p>
              The production order could not be found in this browser session.
            </p>

            <Link href="/orders/new" className="button primary">
              New Content
              <ArrowLeft size={16} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const currentStep = Math.min(order.currentStep ?? 0, PIPELINE.length);
  const isReview = order.status === "review";

  return (
    <main className="page-shell">
      <section className="page-main">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              {isReview ? "READY FOR REVIEW" : "PRODUCTION"}
            </span>

            <h1>{isReview ? "Needs Review" : "In Progress"}</h1>

            <p>
              {isReview
                ? "The production pipeline is complete and the order is ready for operator review."
                : "Bidrano is moving this order through the production pipeline."}
            </p>
          </div>

          <div className="header-actions">
            <Link href="/production" className="button secondary">
              Production
            </Link>
          </div>
        </div>

        <div className="production-layout">
          <section className="production-card">
            <div className="production-card-header">
              <div>
                <span className="eyebrow">ORDER</span>
                <h2>{order.topic || "Untitled Content"}</h2>
              </div>

              <span className={`status-pill ${isReview ? "review" : ""}`}>
                {isReview ? "Needs Review" : "In Progress"}
              </span>
            </div>

            <div className="order-meta-grid">
              <div>
                <span>Customer</span>
                <strong>{order.customerName || "—"}</strong>
              </div>

              <div>
                <span>Business / Specialty</span>
                <strong>{order.customerField || "—"}</strong>
              </div>

              <div>
                <span>Content Type</span>
                <strong>{order.contentType || "—"}</strong>
              </div>

              <div>
                <span>Order ID</span>
                <strong>{order.id}</strong>
              </div>
            </div>

            {order.instructions && (
              <div className="order-instructions">
                <span>Instructions</span>
                <p>{order.instructions}</p>
              </div>
            )}
          </section>

          <section className="production-card pipeline-card">
            <div className="production-card-header">
              <div>
                <span className="eyebrow">PIPELINE</span>
                <h2>Production Stages</h2>
              </div>

              {!isReview && (
                <div className="pipeline-running">
                  <Loader2 className="spin" size={17} />
                  Running
                </div>
              )}

              {isReview && (
                <div className="pipeline-running complete">
                  <CheckCircle2 size={17} />
                  Complete
                </div>
              )}
            </div>

            <div className="pipeline-list">
              {PIPELINE.map((step, index) => {
                const done = index < currentStep;
                const active = index === currentStep && !isReview;

                return (
                  <div className="pipeline-step" key={step}>
                    <div className="pipeline-icon">
                      {done || (isReview && index < PIPELINE.length) ? (
                        <CheckCircle2 size={21} />
                      ) : active ? (
                        <Loader2 className="spin" size={21} />
                      ) : (
                        <Circle size={21} />
                      )}
                    </div>

                    <div className="pipeline-step-copy">
                      <strong>{step}</strong>
                      <span>
                        {done
                          ? "Completed"
                          : active
                            ? "In progress..."
                            : "Waiting"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {isReview && (
              <div className="review-ready">
                <div>
                  <CheckCircle2 size={22} />
                  <div>
                    <strong>Production complete</strong>
                    <p>
                      Review the generated content before approving or
                      regenerating it.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/content/${encodeURIComponent(order.id)}`}
                  className="button primary"
                >
                  Open Review
                  <ArrowLeft size={16} />
                </Link>
              </div>
            )}

            {!isReview && (
              <div className="pipeline-progress">
                <div className="progress-label">
                  <span>Pipeline progress</span>
                  <strong>
                    {currentStep} / {PIPELINE.length}
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(currentStep / PIPELINE.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="production-footer">
          <Link href="/orders/new" className="button secondary">
            <RefreshCw size={16} />
            Create Another Order
          </Link>
        </div>
      </section>
    </main>
  );
}
