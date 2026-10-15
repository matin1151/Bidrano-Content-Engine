"use client";

import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { PIPELINE, ROUTE_STATUS, STATUS_LABELS } from "../../../../lib/mock-data";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import type { Order } from "../../../../lib/models";
import { orderData } from "../../../../lib/data";

export default function ProductionStatus(props: { params: Promise<{ status: string }> }) {
  return <Suspense fallback={<section className="page-main">Loading production...</section>}><StatusContent {...props} /></Suspense>;
}

function StatusContent({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const [status, setStatus] = useState("in-progress");
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<Order[]>([]);
  const query = useSearchParams().toString();

  useEffect(() => {
    let active = true;
    setLoaded(false); setOrder(null); setError(""); setMatches([]);

    params
      .then((resolved) => {
        if (!active) return;

        setStatus(resolved.status);

        const orderId = new URLSearchParams(query).get("order") || undefined;
        const orderStatus = ROUTE_STATUS[resolved.status];
        const matching = orderStatus ? orderData.list().filter((item) => item.status === orderStatus) : [];
        const existing = (orderId ? matching.find((item) => item.id === orderId) : matching[0]) || null;
        setMatches(matching);

        setOrder(existing);

        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [params, query]);

  useEffect(() => {
    if (!loaded || error || !order || order.contentType === "Reel" || order.status !== ROUTE_STATUS[status]) return;
    if (order.status === "review" || order.status === "approved") {
      return;
    }

    if (order.status !== "in-progress") {
      return;
    }

    const timer = window.setTimeout(() => {
      const latest = orderData.get(order.id);
      if (!latest) { setError("The order is no longer available."); return; }
      if (latest.status !== "in-progress") {
        window.location.href = `/production/${latest.status}?order=${encodeURIComponent(latest.id)}`;
        return;
      }
      const nextStep = Math.min(
        latest.currentStep + 1,
        PIPELINE.length
      );

      const nextStatus =
        nextStep >= PIPELINE.length ? "review" : "in-progress";

      const updated: Order = {
        ...latest,
        currentStep: nextStep,
        status: nextStatus,
        pipeline: PIPELINE,
      };

      try { orderData.update(updated); }
      catch { setError("Could not save production progress. Please try again."); return; }
      setOrder(updated);
      if (nextStatus === "review") {
        window.location.href = `/production/review?order=${encodeURIComponent(updated.id)}`;
      }
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [order, loaded, error, status]);

  const pageTitle = STATUS_LABELS[ROUTE_STATUS[status] || "in-progress"] || STATUS_LABELS["in-progress"];

  if (!loaded) {
    return (
      <>
        <section className="page-main">
          <div className="empty-state">
            <Loader2 className="spin" size={24} />
            <h2>Loading production...</h2>
          </div>
        </section>
      </>
    );
  }

  if (!ROUTE_STATUS[status]) notFound();
  if (error) return <section className="page-main"><p role="alert">{error}</p></section>;

  if (!order) {
    return (
      <>
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
      </>
    );
  }

  if (order.contentType === "Reel" && order.status === "in-progress") return <section className="page-main">
    <div className="page-header"><div><span className="eyebrow">PRODUCTION</span><h1>{pageTitle}</h1></div></div>
    <div className="empty-state"><h2>{order.topic}</h2><p>Video generation and export are managed in Reel Studio.</p>
      <Link className="button primary" href={`/reels?order=${encodeURIComponent(order.id)}`}>Reel Studio <ArrowLeft size={16} /></Link>
    </div>
    <div className="status-detail-list section">{matches.filter((item) => item.id !== order.id).map((item) => <Link key={item.id} className="status-detail-row" href={item.contentType === "Reel" ? `/reels?order=${encodeURIComponent(item.id)}` : `/production/${status}?order=${encodeURIComponent(item.id)}`}><span>{item.contentType}</span><strong>{item.topic}</strong><ArrowLeft size={16} /></Link>)}</div>
  </section>;

  const currentStep = Math.min(order.currentStep ?? 0, PIPELINE.length);
  const isReview = order.status === "review";

  return (
    <>
      <section className="page-main">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              {isReview ? "READY FOR REVIEW" : "PRODUCTION"}
            </span>

            <h1>{pageTitle}</h1>

            <p>
              {isReview
                ? "The production pipeline is complete and the order is ready for operator review."
                : order.status === "approved" ? "This order has been approved." : order.status === "revision" ? "This order is waiting for revision." : "Bidrano is moving this order through the production pipeline."}
            </p>
          </div>

          <div className="header-actions">
            <Link href="/production" className="button secondary">
              Production
            </Link>
          </div>
        </div>

        {matches.length > 1 && <div className="status-detail-list">{matches.map((item) => <Link key={item.id} href={`/production/${status}?order=${encodeURIComponent(item.id)}`} className="status-detail-row"><span>{item.id}</span><div><strong>{item.topic}</strong><small>{item.customerName}</small></div><ArrowLeft size={16} /></Link>)}</div>}
        <div className="production-layout">
          <section className="production-card">
            <div className="production-card-header">
              <div>
                <span className="eyebrow">ORDER</span>
                <h2>{order.topic || "Untitled Content"}</h2>
              </div>

              <span className={`status-pill ${order.status || ""}`}>
                {pageTitle}
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

              {order.status === "in-progress" && (
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
                const active = index === currentStep && order.status === "in-progress";

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
    </>
  );
}
