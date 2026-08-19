import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
import {useI18n} from "../lib/i18nContext";
export default function StaffPage({tenantId,branchId,branches}:{tenantId:string,branchId:string|null,branches:any[]}){
 const {lang,label}=useI18n(),c=(en:string,ku:string,ar:string,tr:string)=>lang==="ku"?ku:lang==="ar"?ar:lang==="tr"?tr:en;
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
 const [form,setForm]=useState<any>({employee_no:"",first_name:"",last_name:"",branch_id:branchId||branches[0]?.id||"",job_title:"",email:"",phone:"",assignment_type:"employee"});
 const load=()=>api<any>("/api/staff"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId]);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/staff",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId})});setOpen(false);setForm({...form,employee_no:"",first_name:"",last_name:""});load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title={c("Staff & Teachers","کارمەندان و مامۆستایان","الموظفون والمعلمون","Personel ve Öğretmenler")} description={c("One staff record can hold assignments across multiple branches.","یەک تۆماری کارمەند دەتوانێت چەند دانانێکی کار لە لقە جیاوازەکاندا هەبێت.","يمكن لسجل موظف واحد أن يتضمن تعيينات في عدة فروع.","Tek bir personel kaydı birden fazla şubedeki görevlendirmeleri içerebilir.")} actions={<Button onClick={()=>setOpen(true)}>+ {c("Add staff","زیادکردنی کارمەند","إضافة موظف","Personel ekle")}</Button>}/>
 <div className="panel"><DataTable rows={rows} columns={[
  {key:"employee_no",label:c("Employee #","ژمارەی کارمەند","رقم الموظف","Personel No")},{key:"first_name",label:c("Name","ناو","الاسم","Ad"),render:r=><div><strong>{r.first_name} {r.last_name}</strong><small className="cell-sub">{r.email||""}</small></div>},
  {key:"job_title",label:c("Job title","ناونیشانی کار","المسمى الوظيفي","Görev Unvanı")},{key:"assignments",label:c("Assignments","دانانەکانی کار","التعيينات","Görevlendirmeler"),render:r=><div className="chips">{(r.assignments||[]).map((a:any)=><Badge key={a.id} tone="info">{a.branch_name||c("Group","گرووپ","المجموعة","Grup")} · {label(a.assignment_type)}</Badge>)}</div>},
  {key:"employment_status",label:c("Status","دۆخ","الحالة","Durum"),render:r=><Badge tone="good">{label(r.employment_status)}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title={c("Add staff member","زیادکردنی کارمەند","إضافة موظف","Personel ekle")}>
 {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
  <Field label={c("Employee number","ژمارەی کارمەند","رقم الموظف","Personel numarası")}><input required value={form.employee_no} onChange={e=>setForm({...form,employee_no:e.target.value})}/></Field>
  <Field label={c("Branch","لق","الفرع","Şube")}><select required value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">{c("Select branch","لق هەڵبژێرە","اختر الفرع","Şube seç")}</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
  <Field label={c("First name","ناوی یەکەم","الاسم الأول","Ad")}><input required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/></Field><Field label={c("Last name","ناوی دووەم / خێزان","اسم العائلة","Soyad")}><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/></Field>
  <Field label={c("Job title","ناونیشانی کار","المسمى الوظيفي","Görev unvanı")}><input value={form.job_title} onChange={e=>setForm({...form,job_title:e.target.value})}/></Field>
  <Field label={c("Assignment type","جۆری دانانی کار","نوع التعيين","Görevlendirme türü")}><select value={form.assignment_type} onChange={e=>setForm({...form,assignment_type:e.target.value})}><option value="employee">{c("Employee","کارمەند","موظف","Çalışan")}</option><option value="teacher">{c("Teacher","مامۆستا","معلم","Öğretmen")}</option><option value="manager">{c("Manager","بەڕێوەبەر","مدير","Yönetici")}</option><option value="instructor">{c("Instructor","ڕاهێنەر / مامۆستا","مدرب","Eğitmen")}</option></select></Field>
  <Field label={c("Email","ئیمەیڵ","البريد الإلكتروني","E-posta")}><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field><Field label={c("Phone","ژمارەی تەلەفۆن","الهاتف","Telefon")}><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
  <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>{c("Cancel","هەڵوەشاندنەوە","إلغاء","İptal")}</Button><Button>{c("Add staff","زیادکردنی کارمەند","إضافة موظف","Personel ekle")}</Button></div>
 </form></Modal></div>
}
