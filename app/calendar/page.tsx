
"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const days = [
  { date: "۱۰", day: 10, items: [] },
  { date: "۱۱", day: 11, items: [{ label: "Carousel • دکتر نادری", id: "001" }] },
  { date: "۱۲", day: 12, items: [] },
  { date: "۱۳", day: 13, items: [{ label: "Stories • سوان هانی", id: "002" }] },
  { date: "۱۴", day: 14, items: [] },
  { date: "۱۵", day: 15, items: [{ label: "Reels Pack • استودیو آریا", id: "003" }] },
  { date: "۱۶", day: 16, items: [] },
];

const weekdayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  weekday: "long",
  timeZone: "UTC",
});

function weekday(day: number) {
  // Mehr 1, 1405 corresponds to September 23, 2026.
  return weekdayFormatter.format(new Date(Date.UTC(2026, 8, 22 + day)));
}

export default function Calendar() {
  return <main className="page-shell">
    <aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link><Link href="/calendar" className="mini-active"><CalendarDays size={19} /></Link></aside>
    <section className="page-main">
      <div className="page-header"><div><span className="eyebrow">CONTENT CALENDAR</span><h1>Content Calendar</h1><p>Jalali calendar • Click a day or a content item to open its details.</p></div><div className="calendar-controls"><button type="button" className="icon-button" disabled aria-disabled="true"><ChevronRight size={16} /></button><strong>مهر ۱۴۰۵</strong><button type="button" className="icon-button" disabled aria-disabled="true"><ChevronLeft size={16} /></button></div></div>
      <div className="calendar-card"><div className="calendar-week">{days.map((d) => <div key={d.date} className="day">
        <Link href={"/calendar/day/" + d.day} className="day-link"><small>{weekday(d.day)}</small><b>{d.date}</b></Link>
        {d.items.map((item) => <Link key={item.id} href={"/content/" + item.id} className="calendar-item">{item.label}</Link>)}
        {d.items.length === 0 && <em>No content</em>}
      </div>)}</div></div>
    </section>
  </main>;
}
