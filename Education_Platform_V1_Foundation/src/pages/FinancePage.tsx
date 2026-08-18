import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader,StatCard} from "../components/ui";
export default function FinancePage({tenantId,branchId,branches,students,currency}:{tenantId:string,branchId:string|null,branches:any[],students:any[],currency:string}){
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
 const today=new Date().toISOString().slice(0,10);
 const [form,setForm]=useState<any>({invoice_no:`INV-${Date.now().toString().slice(-6)}`,issue_date:today,due_date:"",total:"",student_id:"",branch_id:branchId||branches[0]?.id||"",currency});
 const load=()=>api<any>("/api/invoices"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId]);
 const billed=rows.reduce((a,r)=>a+Number(r.total||0),0),paid=rows.reduce((a,r)=>a+Number(r.paid_total||0),0);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/invoices",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId,total:Number(form.total)})});setOpen(false);load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title="Student Billing & Finance" description="Branch-aware invoices and balances; accounting layers will post from these records." actions={<Button onClick={()=>setOpen(true)}>+ Create invoice</Button>}/>
 <div className="stats-grid compact"><StatCard label="Billed" value={billed.toLocaleString()} meta={currency}/><StatCard label="Paid" value={paid.toLocaleString()} meta={currency}/><StatCard label="Outstanding" value={(billed-paid).toLocaleString()} meta={currency}/></div>
 <div className="panel mt"><DataTable rows={rows} columns={[
  {key:"invoice_no",label:"Invoice"},{key:"student_no",label:"Student",render:r=>r.student_id?<div><strong>{r.first_name} {r.last_name}</strong><small className="cell-sub">{r.student_no}</small></div>:"—"},
  {key:"branch_name",label:"Branch"},{key:"issue_date",label:"Issued"},{key:"due_date",label:"Due"},
  {key:"total",label:"Total",render:r=>`${Number(r.total).toLocaleString()} ${r.currency}`},
  {key:"status",label:"Status",render:r=><Badge tone={r.status==="paid"?"good":r.status==="past_due"?"bad":"info"}>{r.status}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title="Create student invoice">
  {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
   <Field label="Invoice number"><input required value={form.invoice_no} onChange={e=>setForm({...form,invoice_no:e.target.value})}/></Field>
   <Field label="Branch"><select required value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">Select</option>{branches.map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select></Field>
   <Field label="Student"><select value={form.student_id} onChange={e=>setForm({...form,student_id:e.target.value})}><option value="">General / not linked</option>{students.filter(s=>!form.branch_id||s.branch_id===form.branch_id).map(s=><option value={s.id} key={s.id}>{s.student_no} — {s.first_name} {s.last_name}</option>)}</select></Field>
   <Field label="Amount"><input required type="number" min="0" step="0.01" value={form.total} onChange={e=>setForm({...form,total:e.target.value})}/></Field>
   <Field label="Issue date"><input required type="date" value={form.issue_date} onChange={e=>setForm({...form,issue_date:e.target.value})}/></Field>
   <Field label="Due date"><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></Field>
   <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button>Create invoice</Button></div>
  </form>
 </Modal></div>
}
