
"use client";

import Link from "next/link";
import { CALENDAR_DAYS as days } from "../../lib/mock-data";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar() {
  return <main className="page-shell">
    <aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link><Link href="/calendar" className="mini-active"><CalendarDays size={19} /></Link></aside>
    <section className="page-main">
      <div className="page-header"><div><span className="eyebrow">CONTENT CALENDAR</span><h1>Content Calendar</h1><p>Jalali calendar • Click a day or a content item to open its details.</p></div><div className="calendar-controls"><button type="button" className="icon-button" disabled aria-disabled="true"><ChevronRight size={16} /></button><strong>مهر ۱۴۰۵</strong><button type="button" className="icon-button" disabled aria-disabled="true"><ChevronLeft size={16} /></button></div></div>
      <div className="calendar-card"><div className="calendar-week">{days.map((d) => <div key={d.date} className="day">
        <Link href={"/calendar/day/" + d.day} className="day-link"><small>{d.weekday}</small><b>{d.date}</b></Link>
        {d.items.map((item) => <Link key={item.id} href={"/content/" + item.id} className="calendar-item">{item.contentType} • {item.customerName}</Link>)}
        {d.items.length === 0 && <em>No content</em>}
      </div>)}</div></div>
    </section>
  </main>;
}
