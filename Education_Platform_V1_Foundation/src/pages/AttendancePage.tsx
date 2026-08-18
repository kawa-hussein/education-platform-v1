import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,PageHeader} from "../components/ui";
const statuses=["present","absent","late","excused","medical","authorized","activity","left_early"];
export default function AttendancePage({tenantId,branchId}:{tenantId:string,branchId:string|null}){
 const [date,setDate]=useState(new Date().toISOString().slice(0,10)),[rows,setRows]=useState<any[]>([]),[busy,setBusy]=useState<string|null>(null);
 const load=()=>api<any>("/api/attendance"+qs({tenant_id:tenantId,branch_id:branchId,date})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId,date]);
 async function mark(r:any,status:string){setBusy(r.student_id);try{await api("/api/attendance",{method:"POST",body:JSON.stringify({tenant_id:tenantId,branch_id:r.branch_id,student_id:r.student_id,attendance_date:date,status})});setRows(x=>x.map(y=>y.student_id===r.student_id?{...y,attendance_status:status}:y))}finally{setBusy(null)}}
 return <div><PageHeader title="Attendance" description="Daily register with tenant and branch scope." actions={<input className="date-control" type="date" value={date} onChange={e=>setDate(e.target.value)}/>}/>
 <div className="panel"><div className="register-head"><span>{rows.length} active students</span><span>Click a status to update immediately</span></div>
 <div className="register-list">{rows.map(r=><div className="register-row" key={r.student_id}>
  <div className="register-student"><strong>{r.first_name} {r.last_name}</strong><span>{r.student_no} · {r.branch_name}</span></div>
  <div className="status-actions">{statuses.map(s=><button disabled={busy===r.student_id} key={s} className={(r.attendance_status||"")===s?`status-selected status-${s}`:""} onClick={()=>mark(r,s)}>{s.replace("_"," ")}</button>)}</div>
 </div>)}</div>
 {!rows.length&&<div className="empty-line">No active students in this scope.</div>}</div></div>
}
