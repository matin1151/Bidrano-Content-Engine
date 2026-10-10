import Link from "next/link";
import { CUSTOMERS, CONTENT_TYPES, PRODUCTION_SUMMARY, STATUS_LABELS } from "../../lib/mock-data";
import { ChevronLeft, CircleDot, LoaderCircle, Sparkles } from "lucide-react";

const statuses = PRODUCTION_SUMMARY.map((item) => ({ ...item, href: "/production/" + item.status, title: STATUS_LABELS[item.status] }));

export default function Production() {
  return <main className="page-shell"><aside className="mini-sidebar"><Link href="/" className="mini-logo">B</Link><Link href="/production" className="mini-active"><Sparkles size={19}/></Link></aside><section className="page-main">
    <div className="page-header"><div><span className="eyebrow">PRODUCTION</span><h1>Production</h1><p>Follow each order through Research, Strategy, Visual and QA.</p></div><Link href="/" className="back-link">Dashboard <ChevronLeft size={15}/></Link></div>
    <div className="status-grid">{statuses.map(s=><Link href={s.href} className="status-card" key={s.href}><span className="status-card-count">{s.count}</span><h3>{s.title}</h3><p>{s.text}</p><ChevronLeft size={17}/></Link>)}</div>
    <div className="pipeline"><PipelineStep n="1" title="Order Context" text={CUSTOMERS[0].name + " • " + CONTENT_TYPES[0]} done/><PipelineStep n="2" title="Research" text="Research and source collection" active/><PipelineStep n="3" title="Strategy & Copy" text="Waiting for Research"/><PipelineStep n="4" title="Visual" text="Waiting for final copy"/><PipelineStep n="5" title="QA" text="Brand, content and technical QA"/></div>
  </section></main>
}
function PipelineStep({n,title,text,done,active}:{n:string,title:string,text:string,done?:boolean,active?:boolean}){return <div className={`pipeline-step ${done?"done":""} ${active?"active":""}`}><span className="pipeline-number">{done?"✓":n}</span><div><h3>{title}</h3><p>{text}</p></div>{active&&<LoaderCircle className="spin" size={18}/>} {!done&&!active&&<CircleDot size={17}/>}</div>}
