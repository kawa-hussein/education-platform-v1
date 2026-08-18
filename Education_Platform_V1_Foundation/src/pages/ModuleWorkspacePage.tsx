import React,{useMemo,useState} from "react";
import {architectureModules} from "../data/modules";
import {moduleSections} from "../data/moduleSections";
import {Badge,Button,PageHeader} from "../components/ui";
import {foundationOperationalCodes,operationalRouteByCode} from "../data/enterpriseNav";

const depthLayers=["Entities","Relationships","States","Actions","Validation","Business Rules","Workflows","Approvals","Permissions","Data Scope","Events","Automations","Notifications","Audit","Configuration","Integrations","API","Reports","KPIs","Retention","Privacy"];

export default function ModuleWorkspacePage({code,onNavigate}:{code:string,onNavigate:(route:string)=>void}){
  const mod=architectureModules.find(m=>m.code===code);
  const [active,setActive]=useState(0);
  const sections=(moduleSections[code]||[]).map(title=>({title,items:[]}));
  const section=sections[Math.min(active,Math.max(0,sections.length-1))];
  const isLive=foundationOperationalCodes.has(code);
  const vertical=code.slice(0,1);
  const plane=vertical==="P"?"Provider Control Plane":vertical==="A"?"Platform Core":vertical==="B"?"School / K-12 Pack":vertical==="C"?"Academy Pack":"Higher-Education Pack";
  const maturity=useMemo(()=>isLive?"Operational foundation":"Architecture-backed workspace",[isLive]);
  if(!mod)return <div className="panel"><h3>Module not found</h3><p className="muted-text">The requested architecture module is not registered.</p></div>;
  return <div className="module-workspace">
    <PageHeader
      title={`${code} · ${mod.title}`}
      description={`${plane} · Master Architecture V6.0 · source line ${mod.line}`}
      actions={<div className="page-actions"><Badge tone={isLive?"good":"info"}>{maturity}</Badge>{isLive&&operationalRouteByCode[code]&&<Button onClick={()=>onNavigate(operationalRouteByCode[code])}>Open live workspace</Button>}</div>}
    />
    <div className="workspace-command-strip">
      <div><span className="command-kicker">Architecture depth</span><strong>L3 Module → L4 Page → L5 View → L6 Workspace → L7 Tab → L9 Section</strong></div>
      <div className="workspace-state"><span className={isLive?"state-dot live":"state-dot"}></span>{isLive?"Connected to current V1 APIs":"UI/IA scaffold; backend implementation pending"}</div>
    </div>

    <div className="workspace-tabs" role="tablist">
      {sections.map((s,i)=><button key={s.title} className={i===active?"active":""} onClick={()=>setActive(i)}>{s.title}</button>)}
    </div>

    <div className="workspace-layout">
      <section className="workspace-main panel">
        <div className="workspace-section-head"><div><span className="eyebrow">{code} / {String(active+1).padStart(2,"0")}</span><h2>{section?.title||"Workspace"}</h2></div><Button variant="secondary">Actions ▾</Button></div>
        <div className="workspace-card-grid">
          {["Overview & records","Workflow & approvals","Permissions & data scope","Events & automation","Reports & KPIs","Configuration & audit"].map((item,i)=><article className="workspace-feature-card" key={item}>
            <div className="feature-card-top"><span className="feature-index">{String(i+1).padStart(2,"0")}</span><span className="feature-status">V6</span></div>
            <h3>{item}</h3>
            <p>{section?.title||"Workspace"} · structured implementation layer for this module. Production records will attach here as the domain is built.</p>
            <button className="text-action">Open workspace <span>→</span></button>
          </article>)}
        </div>
      </section>

      <aside className="workspace-aside">
        <section className="panel architecture-guardrail">
          <div className="panel-head"><h3>Domain completeness gate</h3><Badge tone="neutral">V6</Badge></div>
          <p className="muted-text">Every production module must be reviewed across the cross-cutting layers below before it is marked complete.</p>
          <div className="depth-chip-grid">{depthLayers.map(x=><span key={x}>{x}</span>)}</div>
        </section>
        <section className="panel mt">
          <div className="panel-head"><h3>Implementation status</h3><Badge tone={isLive?"good":"warn"}>{isLive?"Foundation live":"Staged"}</Badge></div>
          <div className="status-stack">
            <div><span>Information architecture</span><strong>Ready</strong></div>
            <div><span>Navigation & workspace shell</span><strong>Ready</strong></div>
            <div><span>Data model</span><strong>{isLive?"Partial":"Queued"}</strong></div>
            <div><span>Workflow / approvals</span><strong>Queued</strong></div>
            <div><span>Reports / KPIs</span><strong>Queued</strong></div>
          </div>
        </section>
      </aside>
    </div>
  </div>
}
