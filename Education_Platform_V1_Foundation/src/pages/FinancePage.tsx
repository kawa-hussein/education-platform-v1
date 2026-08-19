import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader,StatCard} from "../components/ui";
import {useI18n} from "../lib/i18nContext";
export default function FinancePage({tenantId,branchId,branches,students,currency}:{tenantId:string,branchId:string|null,branches:any[],students:any[],currency:string}){
 const {lang,label}=useI18n(),c=(en:string,ku:string,ar:string,tr:string)=>lang==="ku"?ku:lang==="ar"?ar:lang==="tr"?tr:en;
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");const today=new Date().toISOString().slice(0,10);
 const [form,setForm]=useState<any>({invoice_no:`INV-${Date.now().toString().slice(-6)}`,issue_date:today,due_date:"",total:"",student_id:"",branch_id:branchId||branches[0]?.id||"",currency});
 const load=()=>api<any>("/api/invoices"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows));useEffect(()=>{load()},[tenantId,branchId]);
 const billed=rows.reduce((a,r)=>a+Number(r.total||0),0),paid=rows.reduce((a,r)=>a+Number(r.paid_total||0),0);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/invoices",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId,total:Number(form.total)})});setOpen(false);load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title={c("Student Billing & Finance","پسولە و دارایی قوتابی","فوترة الطلاب والمالية","Öğrenci Faturalama ve Finans")} description={c("Branch-aware invoices and balances; accounting layers post from these records.","پسولە و باڵانسەکان بە لقەوە بەستراون؛ لایەنی ژمێریاری لەم تۆمارانەوە پۆست دەکات.","فواتير وأرصدة مرتبطة بالفروع؛ تنطلق القيود المحاسبية من هذه السجلات.","Şube bazlı faturalar ve bakiyeler; muhasebe katmanı bu kayıtlardan fiş oluşturur.")} actions={<Button onClick={()=>setOpen(true)}>+ {c("Create invoice","دروستکردنی پسولە","إنشاء فاتورة","Fatura oluştur")}</Button>}/>
 <div className="stats-grid compact"><StatCard label={c("Billed","پسولەکراو","تمت فوترته","Faturalandı")} value={billed.toLocaleString()} meta={currency}/><StatCard label={c("Paid","پارەدراو","مدفوع","Ödendi")} value={paid.toLocaleString()} meta={currency}/><StatCard label={c("Outstanding","ماوە / قەرز","مستحق","Ödenmemiş")} value={(billed-paid).toLocaleString()} meta={currency}/></div>
 <div className="panel mt"><DataTable rows={rows} columns={[
  {key:"invoice_no",label:c("Invoice","پسولە","الفاتورة","Fatura")},{key:"student_no",label:c("Student","قوتابی","الطالب","Öğrenci"),render:r=>r.student_id?<div><strong>{r.first_name} {r.last_name}</strong><small className="cell-sub">{r.student_no}</small></div>:"—"},
  {key:"branch_name",label:c("Branch","لق","الفرع","Şube")},{key:"issue_date",label:c("Issued","دەرکراوە","تاريخ الإصدار","Düzenlendi")},{key:"due_date",label:c("Due","بەرواری کۆتایی","الاستحقاق","Vade")},
  {key:"total",label:c("Total","کۆی گشتی","الإجمالي","Toplam"),render:r=>`${Number(r.total).toLocaleString()} ${r.currency}`},{key:"status",label:c("Status","دۆخ","الحالة","Durum"),render:r=><Badge tone={r.status==="paid"?"good":r.status==="past_due"?"bad":"info"}>{label(r.status)}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title={c("Create student invoice","دروستکردنی پسولەی قوتابی","إنشاء فاتورة طالب","Öğrenci faturası oluştur")}>
  {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
   <Field label={c("Invoice number","ژمارەی پسولە","رقم الفاتورة","Fatura numarası")}><input required value={form.invoice_no} onChange={e=>setForm({...form,invoice_no:e.target.value})}/></Field>
   <Field label={c("Branch","لق","الفرع","Şube")}><select required value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">{c("Select","هەڵبژێرە","اختر","Seç")}</option>{branches.map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select></Field>
   <Field label={c("Student","قوتابی","الطالب","Öğrenci")}><select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})}><option value="">{c("General / not linked","گشتی / بە قوتابییەوە نەبەستراوە","عام / غير مرتبط","Genel / bağlantısız")}</option>{students.filter(s=>!form.branch_id||s.branch_id===form.branch_id).map(s=><option value={s.id} key={s.id}>{s.student_no} — {s.first_name} {s.last_name}</option>)}</select></Field>
   <Field label={c("Amount","بڕی پارە","المبلغ","Tutar")}><input required type="number" min="0" step="0.01" value={form.total} onChange={e=>setForm({...form,total:e.target.value})}/></Field>
   <Field label={c("Issue date","بەرواری دەرکردن","تاريخ الإصدار","Düzenleme tarihi")}><input required type="date" value={form.issue_date} onChange={e=>setForm({...form,issue_date:e.target.value})}/></Field><Field label={c("Due date","بەرواری کۆتایی پارەدان","تاريخ الاستحقاق","Vade tarihi")}><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></Field>
   <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>{c("Cancel","هەڵوەشاندنەوە","إلغاء","İptal")}</Button><Button>{c("Create invoice","دروستکردنی پسولە","إنشاء فاتورة","Fatura oluştur")}</Button></div>
  </form>
 </Modal></div>
}
