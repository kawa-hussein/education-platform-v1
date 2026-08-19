import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader,StatCard} from "../components/ui";
import {useI18n} from "../lib/i18nContext";
export default function PayrollPage({tenantId,branchId,branches,staff,currency}:{tenantId:string,branchId:string|null,branches:any[],staff:any[],currency:string}){
 const {lang,label}=useI18n(),c=(en:string,ku:string,ar:string,tr:string)=>lang==="ku"?ku:lang==="ar"?ar:lang==="tr"?tr:en;
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
 const now=new Date(),month=now.toLocaleString(lang==="ku"?"ku-Arab":lang,{month:"long",year:"numeric"}),start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)).toISOString().slice(0,10),end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,0)).toISOString().slice(0,10);
 const [form,setForm]=useState<any>({staff_id:"",branch_id:branchId||branches[0]?.id||"",period_name:month,starts_on:start,ends_on:end,base_pay:0,variable_pay:0,bonus:0,allowances:0,deductions:0});
 const load=()=>api<any>("/api/payroll"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows));useEffect(()=>{load()},[tenantId,branchId]);
 const total=rows.reduce((a,r)=>a+Number(r.net_pay||0),0);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/payroll",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId})});setOpen(false);load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title={c("Payroll & Compensation","مووچە و پاداشت","الرواتب والتعويضات","Bordro ve Ücretlendirme")} description={c("Supports fixed pay and variable teacher compensation components.","مووچەی جێگیر و پاداشتی گۆڕاو بۆ مامۆستا و کارمەند پشتگیری دەکات.","يدعم الرواتب الثابتة ومكونات التعويض المتغيرة للمعلمين والموظفين.","Sabit ücret ve öğretmen/personel için değişken ücret bileşenlerini destekler.")} actions={<Button onClick={()=>setOpen(true)}>+ {c("Payroll entry","تۆماری مووچە","قيد راتب","Bordro kaydı")}</Button>}/>
 <div className="stats-grid compact"><StatCard label={c("Entries","تۆمارەکان","القيود","Kayıtlar")} value={rows.length}/><StatCard label={c("Net payroll","کۆی مووچەی خاوێن","صافي الرواتب","Net bordro")} value={total.toLocaleString()} meta={currency}/></div>
 <div className="panel mt"><DataTable rows={rows} columns={[
  {key:"employee_no",label:c("Employee","کارمەند","الموظف","Çalışan")},{key:"first_name",label:c("Name","ناو","الاسم","Ad"),render:r=><strong>{r.first_name} {r.last_name}</strong>},{key:"period_name",label:c("Period","ماوە","الفترة","Dönem")},
  {key:"base_pay",label:c("Base","مووچەی بنەڕەتی","الأساسي","Temel"),render:r=>Number(r.base_pay).toLocaleString()},{key:"variable_pay",label:c("Variable","گۆڕاو","المتغير","Değişken"),render:r=>Number(r.variable_pay).toLocaleString()},
  {key:"deductions",label:c("Deductions","لێبڕینەکان","الاستقطاعات","Kesintiler"),render:r=>Number(r.deductions).toLocaleString()},{key:"net_pay",label:c("Net","خاوێن","الصافي","Net"),render:r=><strong>{Number(r.net_pay).toLocaleString()}</strong>},
  {key:"status",label:c("Status","دۆخ","الحالة","Durum"),render:r=><Badge tone="info">{label(r.status)}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title={c("Create payroll entry","دروستکردنی تۆماری مووچە","إنشاء قيد راتب","Bordro kaydı oluştur")}>
  {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
   <Field label={c("Staff member","کارمەند","الموظف","Personel")}><select required value={form.staff_id} onChange={e=>setForm({...form,staff_id:e.target.value})}><option value="">{c("Select","هەڵبژێرە","اختر","Seç")}</option>{staff.map(s=><option key={s.id} value={s.id}>{s.employee_no} — {s.first_name} {s.last_name}</option>)}</select></Field>
   <Field label={c("Branch","لق","الفرع","Şube")}><select value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">{c("Group / shared","گرووپ / هاوبەش","المجموعة / مشترك","Grup / ortak")}</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
   <Field label={c("Period name","ناوی ماوە","اسم الفترة","Dönem adı")}><input value={form.period_name} onChange={e=>setForm({...form,period_name:e.target.value})}/></Field>
   <Field label={c("Base monthly pay","مووچەی بنەڕەتی مانگانە","الراتب الشهري الأساسي","Temel aylık ücret")}><input type="number" value={form.base_pay} onChange={e=>setForm({...form,base_pay:Number(e.target.value)})}/></Field>
   <Field label={c("Variable / % / class pay","پاداشتی گۆڕاو / ڕێژە / پۆل","الأجر المتغير / النسبة / الصف","Değişken / % / sınıf ücreti")}><input type="number" value={form.variable_pay} onChange={e=>setForm({...form,variable_pay:Number(e.target.value)})}/></Field>
   <Field label={c("Bonus","بۆنەس","المكافأة","Prim")}><input type="number" value={form.bonus} onChange={e=>setForm({...form,bonus:Number(e.target.value)})}/></Field><Field label={c("Allowances","پاشکۆی مووچە","البدلات","Ek ödemeler")}><input type="number" value={form.allowances} onChange={e=>setForm({...form,allowances:Number(e.target.value)})}/></Field><Field label={c("Deductions","لێبڕینەکان","الاستقطاعات","Kesintiler")}><input type="number" value={form.deductions} onChange={e=>setForm({...form,deductions:Number(e.target.value)})}/></Field>
   <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>{c("Cancel","هەڵوەشاندنەوە","إلغاء","İptal")}</Button><Button>{c("Create payroll entry","دروستکردنی تۆماری مووچە","إنشاء قيد راتب","Bordro kaydı oluştur")}</Button></div>
  </form>
 </Modal></div>
}
