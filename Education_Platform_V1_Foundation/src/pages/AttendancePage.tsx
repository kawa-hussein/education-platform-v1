import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {PageHeader} from "../components/ui";
import {useI18n} from "../lib/i18nContext";
const statuses=["present","absent","late","excused","medical","authorized","activity","left_early"];
export default function AttendancePage({tenantId,branchId}:{tenantId:string,branchId:string|null}){
 const {lang}=useI18n(),c=(en:string,ku:string,ar:string,tr:string)=>lang==="ku"?ku:lang==="ar"?ar:lang==="tr"?tr:en;
 const statusName:Record<string,string>={present:c("Present","ئامادە","حاضر","Var"),absent:c("Absent","نائامادە","غائب","Yok"),late:c("Late","دواکەوتوو","متأخر","Geç"),excused:c("Excused","بە بیانووی پەسەندکراو","بعذر","Mazeretli"),medical:c("Medical","پزیشکی","طبي","Sağlık"),authorized:c("Authorized","ڕێگەپێدراو","مأذون","İzinli"),activity:c("School activity","چالاکی قوتابخانە","نشاط مدرسي","Okul etkinliği"),left_early:c("Left early","زوو دەرچوو","غادر مبكراً","Erken ayrıldı")};
 const [date,setDate]=useState(new Date().toISOString().slice(0,10)),[rows,setRows]=useState<any[]>([]),[busy,setBusy]=useState<string|null>(null);
 const load=()=>api<any>("/api/attendance"+qs({tenant_id:tenantId,branch_id:branchId,date})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId,date]);
 async function mark(r:any,status:string){setBusy(r.student_id);try{await api("/api/attendance",{method:"POST",body:JSON.stringify({tenant_id:tenantId,branch_id:r.branch_id,student_id:r.student_id,attendance_date:date,status})});setRows(x=>x.map(y=>y.student_id===r.student_id?{...y,attendance_status:status}:y))}finally{setBusy(null)}}
 return <div><PageHeader title={c("Attendance","ئامادەبوون","الحضور","Devam")} description={c("Daily attendance register with tenant and branch scope.","تۆماری ڕۆژانەی ئامادەبوون بە ئاستی کڕیار و لق.","سجل الحضور اليومي ضمن نطاق العميل والفرع.","Müşteri ve şube kapsamlı günlük yoklama.")} actions={<input className="date-control" type="date" value={date} onChange={e=>setDate(e.target.value)}/>}/>
 <div className="panel"><div className="register-head"><span>{rows.length} {c("active students","قوتابی چالاک","طلاب نشطون","aktif öğrenci")}</span><span>{c("Click a status to update immediately","دۆخێک هەڵبژێرە بۆ نوێکردنەوەی دەستبەجێ","اختر حالة للتحديث فوراً","Hemen güncellemek için bir duruma tıklayın")}</span></div>
 <div className="register-list">{rows.map(r=><div className="register-row" key={r.student_id}><div className="register-student"><strong>{r.first_name} {r.last_name}</strong><span>{r.student_no} · {r.branch_name}</span></div><div className="status-actions">{statuses.map(s=><button disabled={busy===r.student_id} key={s} className={(r.attendance_status||"")===s?`status-selected status-${s}`:""} onClick={()=>mark(r,s)}>{statusName[s]}</button>)}</div></div>)}</div>
 {!rows.length&&<div className="empty-line">{c("No active students in this scope.","هیچ قوتابییەکی چالاک لەم ئاستەدا نییە.","لا يوجد طلاب نشطون ضمن هذا النطاق.","Bu kapsamda aktif öğrenci yok.")}</div>}</div></div>
}
