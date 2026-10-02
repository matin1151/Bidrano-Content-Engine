import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const data: Record<string, { title: string; description: string; items: string[] }> = {
  "in-progress": {
    title: "In Progress",
    description: "Orders currently moving through the production pipeline.",
    items: [
      "۵ اشتباه رایج در مسواک زدن",
      "چطور عسل طبیعی را تشخیص دهیم؟",
      "پشت صحنه عکاسی برند",
    ],
  },
  review: {
    title: "Needs Review",
    description: "Content packages waiting for your human review.",
    items: ["راهنمای مراقبت از لثه", "معرفی خدمات جدید کلینیک", "۳ ایده برای استوری"],
  },
  approved: {
    title: "Approved",
    description: "Approved content and final deliverables.",
    items: ["بهداشت دهان", "مسواک زدن", "مراقبت از لثه"],
  },
};

export default async function ProductionStatus({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const current = data[status] || data["in-progress"];

  return (
    <main className="page-shell">
      <aside className="mini-sidebar">
        <Link href="/" className="mini-logo" aria-label="Dashboard">
          B
        </Link>
      </aside>

      <section className="page-main">
        <header className="page-header">
          <div>
            <Link href="/production" className="back-link">
              <ChevronRight size={15} />
              Production
            </Link>

            <span className="eyebrow">STATUS</span>

            <h1>{current.title}</h1>
            <p>{current.description}</p>
          </div>
        </header>

        <div className="status-detail-list">
          {current.items.map((item, index) => (
            <Link
              href={`/content/00${index + 1}`}
              className="status-detail-row"
              key={item}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>

              <div>
                <strong>{item}</strong>
                <small>دکتر نادری • Carousel • Updated today</small>
              </div>

              <ChevronLeft size={17} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
