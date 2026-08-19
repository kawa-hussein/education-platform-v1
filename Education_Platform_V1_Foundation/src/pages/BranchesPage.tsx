import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
import {useI18n} from "../lib/i18nContext";
export default function BranchesPage({tenantId,onChanged}:{tenantId:string,onChanged:()=>void}){
 const {lang,label}=useI18n(),c=(en:string,ku:string,ar:string,tr:string)=>lang==="ku"?ku:lang==="ar"?ar:lang==="tr"?tr:en;
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
 const [form,setForm]=useState<any>({name:"",code:"",type:"school",city:"",phone:"",email:""});
 const load=()=>api<any>("/api/branches"+qs({tenant_id:tenantId})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId]);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/branches",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId})});setOpen(false);setForm({...form,name:"",code:""});load();onChanged()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title={c("Branches / Campuses","لقەکان / کامپەسەکان","الفروع / الحُرُم","Şubeler / Kampüsler")} description={c("Local school units inside this education group.","یەکە ناوخۆییەکانی قوتابخانە لە ناو ئەم گرووپی پەروەردەییەدا.","الوحدات المدرسية المحلية ضمن هذه المجموعة التعليمية.","Bu eğitim grubu içindeki yerel okul birimleri.")} actions={<Button onClick={()=>setOpen(true)}>+ {c("Add branch","زیادکردنی لق","إضافة فرع","Şube ekle")}</Button>}/>
 <div className="panel"><DataTable rows={rows} columns={[
   {key:"name",label:c("Branch","لق","الفرع","Şube"),render:r=><div><strong>{r.name}</strong><small className="cell-sub">{r.code}</small></div>},
   {key:"type",label:c("Type","جۆر","النوع","Tür"),render:r=><Badge tone="info">{label(r.type)}</Badge>},{key:"city",label:c("City","شار","المدينة","Şehir")},
   {key:"student_count",label:c("Students","قوتابیان","الطلاب","Öğrenciler")},{key:"staff_count",label:c("Staff","کارمەندان","الموظفون","Personel")},{key:"status",label:c("Status","دۆخ","الحالة","Durum"),render:r=><Badge tone="good">{label(r.status)}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title={c("Add school branch","زیادکردنی لقی قوتابخانە","إضافة فرع مدرسة","Okul şubesi ekle")}>
  {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
   <Field label={c("Branch name","ناوی لق","اسم الفرع","Şube adı")}><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
   <Field label={c("Branch code","کۆدی لق","رمز الفرع","Şube kodu")}><input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></Field>
   <Field label={c("Type","جۆر","النوع","Tür")}><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="school">{c("School","قوتابخانە","مدرسة","Okul")}</option><option value="campus">{c("Campus","کامپەس","حرم","Kampüs")}</option><option value="academy">{c("Academy","ئەکادیمی","أكاديمية","Akademi")}</option><option value="university">{c("University","زانکۆ","جامعة","Üniversite")}</option></select></Field>
   <Field label={c("City","شار","المدينة","Şehir")}><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></Field>
   <Field label={c("Phone","ژمارەی تەلەفۆن","الهاتف","Telefon")}><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
   <Field label={c("Email","ئیمەیڵ","البريد الإلكتروني","E-posta")}><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
   <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>{c("Cancel","هەڵوەشاندنەوە","إلغاء","İptal")}</Button><Button>{c("Add branch","زیادکردنی لق","إضافة فرع","Şube ekle")}</Button></div>
  </form>
 </Modal></div>
}
