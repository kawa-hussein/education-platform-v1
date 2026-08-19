import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
import {useI18n} from "../lib/i18nContext";
export default function StudentsPage({tenantId,branchId,branches}:{tenantId:string,branchId:string|null,branches:any[]}){
 const {lang,label}=useI18n(),c=(en:string,ku:string,ar:string,tr:string)=>lang==="ku"?ku:lang==="ar"?ar:lang==="tr"?tr:en;
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[q,setQ]=useState(""),[error,setError]=useState("");
 const [form,setForm]=useState<any>({student_no:"",first_name:"",last_name:"",branch_id:branchId||branches[0]?.id||"",gender:"",date_of_birth:"",email:"",phone:""});
 const load=()=>api<any>("/api/students"+qs({tenant_id:tenantId,branch_id:branchId,q})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId]);useEffect(()=>{if(branchId)setForm((x:any)=>({...x,branch_id:branchId}))},[branchId]);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/students",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId})});setOpen(false);setForm({...form,student_no:"",first_name:"",last_name:""});load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title={c("Students","قوتابیان","الطلاب","Öğrenciler")} description={c("Canonical student records scoped to tenant and branch.","تۆماری سەرەکی قوتابیان بە پێی کڕیار و لق سنووردار دەکرێت.","سجلات الطلاب الرئيسية ضمن نطاق العميل والفرع.","Müşteri ve şube kapsamındaki ana öğrenci kayıtları.")} actions={<Button onClick={()=>setOpen(true)}>+ {c("Add student","زیادکردنی قوتابی","إضافة طالب","Öğrenci ekle")}</Button>}/>
 <div className="toolbar"><input placeholder={c("Search student number or name…","گەڕان بە ژمارە یان ناوی قوتابی…","البحث برقم الطالب أو اسمه…","Öğrenci numarası veya adı ara…")} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")load()}}/><Button variant="secondary" onClick={load}>{c("Search","گەڕان","بحث","Ara")}</Button></div>
 <div className="panel"><DataTable rows={rows} columns={[
  {key:"student_no",label:c("Student #","ژمارەی قوتابی","رقم الطالب","Öğrenci No")},{key:"first_name",label:c("Student","قوتابی","الطالب","Öğrenci"),render:r=><div><strong>{r.first_name} {r.last_name}</strong><small className="cell-sub">{r.email||r.phone||""}</small></div>},
  {key:"branch_name",label:c("Branch","لق","الفرع","Şube")},{key:"grade_name",label:c("Grade","ئاست / پۆل","المرحلة","Sınıf Düzeyi")},{key:"class_name",label:c("Class","پۆل","الصف","Sınıf")},{key:"status",label:c("Status","دۆخ","الحالة","Durum"),render:r=><Badge tone={r.status==="active"?"good":"neutral"}>{label(r.status)}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title={c("Create student record","دروستکردنی تۆماری قوتابی","إنشاء سجل طالب","Öğrenci kaydı oluştur")}>
  {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
   <Field label={c("Student number","ژمارەی قوتابی","رقم الطالب","Öğrenci numarası")}><input required value={form.student_no} onChange={e=>setForm({...form,student_no:e.target.value})}/></Field>
   <Field label={c("Branch","لق","الفرع","Şube")}><select required value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">{c("Select branch","لق هەڵبژێرە","اختر الفرع","Şube seç")}</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
   <Field label={c("First name","ناوی یەکەم","الاسم الأول","Ad")}><input required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/></Field><Field label={c("Last name","ناوی دووەم / خێزان","اسم العائلة","Soyad")}><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/></Field>
   <Field label={c("Date of birth","بەرواری لەدایکبوون","تاريخ الميلاد","Doğum tarihi")}><input type="date" value={form.date_of_birth} onChange={e=>setForm({...form,date_of_birth:e.target.value})}/></Field><Field label={c("Gender","ڕەگەز","الجنس","Cinsiyet")}><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="">{c("Not specified","دیاری نەکراوە","غير محدد","Belirtilmemiş")}</option><option value="Male">{c("Male","نێر","ذكر","Erkek")}</option><option value="Female">{c("Female","مێ","أنثى","Kadın")}</option></select></Field>
   <Field label={c("Email","ئیمەیڵ","البريد الإلكتروني","E-posta")}><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field><Field label={c("Phone","ژمارەی تەلەفۆن","الهاتف","Telefon")}><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
   <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>{c("Cancel","هەڵوەشاندنەوە","إلغاء","İptal")}</Button><Button>{c("Create student","دروستکردنی قوتابی","إنشاء الطالب","Öğrenci oluştur")}</Button></div>
  </form>
 </Modal></div>
}
