import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="app-shell"><Sidebar /><main className="workspace-content">{children}</main></div>;
}
