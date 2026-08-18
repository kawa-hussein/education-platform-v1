import React from "react";

export function Badge({children,tone="neutral"}:{children:React.ReactNode,tone?:"neutral"|"good"|"warn"|"bad"|"info"}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function Button({children,variant="primary",...props}:React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:"primary"|"secondary"|"ghost"|"danger"}) {
  return <button {...props} className={`btn btn-${variant} ${props.className||""}`}>{children}</button>;
}
export function StatCard({label,value,meta}:{label:string,value:React.ReactNode,meta?:string}) {
  return <div className="stat-card"><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{meta&&<div className="stat-meta">{meta}</div>}</div>;
}
export function Empty({title="No data yet",description,action}:{title?:string,description?:string,action?:React.ReactNode}) {
  return <div className="empty"><div className="empty-icon">◇</div><h3>{title}</h3>{description&&<p>{description}</p>}{action}</div>;
}
export function Modal({open,title,onClose,children,width=640}:{open:boolean,title:string,onClose:()=>void,children:React.ReactNode,width?:number}) {
  if(!open)return null;
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="modal" style={{maxWidth:width}}><div className="modal-head"><h2>{title}</h2><button onClick={onClose} className="icon-btn">×</button></div><div className="modal-body">{children}</div></div>
  </div>;
}
export function Field({label,children,hint}:{label:string,children:React.ReactNode,hint?:string}) {
  return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;
}
export function PageHeader({title,description,actions}:{title:string,description?:string,actions?:React.ReactNode}) {
  return <div className="page-head"><div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{actions&&<div className="page-actions">{actions}</div>}</div>;
}
export function DataTable({columns,rows,empty="No records"}:{columns:{key:string,label:string,render?:(row:any)=>React.ReactNode}[],rows:any[],empty?:string}) {
  if(!rows.length)return <Empty title={empty}/>;
  return <div className="table-wrap"><table><thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead><tbody>
    {rows.map((r,i)=><tr key={r.id||i}>{columns.map(c=><td key={c.key}>{c.render?c.render(r):String(r[c.key]??"—")}</td>)}</tr>)}
  </tbody></table></div>;
}
