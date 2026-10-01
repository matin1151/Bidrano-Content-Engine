"use client";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const days = [
  { date: "۱۰", weekday: "شنبه", items: [] },
  { date: "۱۱", weekday: "یکشنبه", items: ["Carousel • دکتر نادری"] },
  { date: "۱۲", weekday: "دوشنبه", items: [] },
  { date: "۱۳", weekday: "سه‌شنبه", items: ["Stories • سوان هانی"] },
  { date: "۱۴", weekday: "چهارشنبه", items: [] },
  { date: "۱۵", weekday: "پنجشنبه", items: ["Reels Pack • استودیو آریا"] },
  { date: "۱۶", weekday: "جمعه", items: [] },
];

export default function Calendar(){return <main className="page-shell"><aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link><Link href="/calendar" className="mini-active"><CalendarDays size={19}/></Link></aside><section className="page-main"><div className="page-header"><div><span className="eyebrow">CONTENT CALENDAR</span><h1>Content Calendar</h1><p>Jalali calendar • Click a day or a content item to open its details.</p></div><div className="calendar-controls"><button className="icon-button"><ChevronRight size={16}/></button><strong>مهر ۱۴۰۵</strong><button className="icon-button"><ChevronLeft size={16}/></button></div></div><div className="calendar-card"><div className="calendar-week">{days.map((d,i)=><Link href={`/calendar/day/${i+1}`} key={d.date} className="day"><small>{d.weekday}</small><b>{d.date}</b>{d.items.map((item,j)=><span key={item} onClick={(e)=>e.stopPropagation()}>{item}</span>)}{d.items.length===0&&<em>No content</em>}</Link>)}</div></div></section></main>}
