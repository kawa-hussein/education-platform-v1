import React,{useMemo,useState} from "react";
import {architectureModules} from "../data/modules";
import {Badge,PageHeader} from "../components/ui";
const verticalName:Record<string,string>={P:"Provider / SaaS Control Plane",A:"Platform Core",B:"School / K-12",C:"Academy / After-School",D:"Higher Education",E:"Extensions"};
const implemented=new Set(["P01","P02","P05","P06","P08","P09","A01","A02","A03","A05","A06","A07","A16","A19","A20","B04","B05","B10","B30","B35"]);
export default function ArchitecturePage(){
 const [q,setQ]=useState(""),[v,setV]=useState("ALL");
 const filtered=useMemo(()=>architectureModules.filter(m=>(v==="ALL"||m.vertical===v)&&(`${m.code} ${m.title}`.toLowerCase().includes(q.toLowerCase()))),[q,v]);
 return <div><PageHeader title="Master Architecture Coverage" description="The V6 master plan is embedded in the repository. This screen keeps development tied to the approved architecture."/>
 <div className="toolbar"><input placeholder="Search 169 modules…" value={q} onChange={e=>setQ(e.target.value)}/><select value={v} onChange={e=>setV(e.target.value)}><option value="ALL">All verticals</option>{Object.entries(verticalName).map(([k,n])=><option key={k} value={k}>{n}</option>)}</select></div>
 <div className="architecture-grid">{filtered.map(m=><article className="architecture-card" key={m.code}><div><Badge tone={implemented.has(m.code)?"good":"neutral"}>{m.code}</Badge><small>{verticalName[m.vertical]}</small></div><h3>{m.title}</h3><div className="arch-status">{implemented.has(m.code)?"Foundation implemented":"Registered for staged implementation"}</div></article>)}</div>
 </div>
}
