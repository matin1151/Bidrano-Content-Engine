"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clapperboard, FolderKanban, LayoutDashboard, Sparkles, Users, WandSparkles } from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Production", href: "/production", icon: WandSparkles },
  { label: "Reel Studio", href: "/reels", icon: Clapperboard },
  { label: "Content Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Content Memory", href: "/memory", icon: FolderKanban },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sidebar">
        <div className="brand"><div className="brand-mark">B</div><div><strong>Bidrano</strong><small>CONTENT STUDIO</small></div></div>
        <nav className="sidebar-nav"><span className="nav-label">STUDIO</span>
          {nav.map(({ label, href, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" :
              pathname === href || pathname.startsWith(href + "/") ||
              (href === "/production" && pathname.startsWith("/orders/")) ||
              (href === "/memory" && pathname.startsWith("/content/"));
            return <Link key={label} href={href} aria-label={label} title={label} className={`nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}><Icon size={18}/><span>{label}</span></Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="smart-tip"><Sparkles size={17}/><div><strong>Smart Suggestion</strong><small dir="ltr">3 ideas for today</small></div></div>
          <div className="user-card"><div className="avatar">M</div><div><strong>Matin</strong><small>Studio Manager</small></div></div>
        </div>
      </aside>
  );
}
