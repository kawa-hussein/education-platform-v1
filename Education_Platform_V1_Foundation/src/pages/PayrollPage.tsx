import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader,StatCard} from "../components/ui";
export default function PayrollPage({tenantId,branchId,branches,staff,currency}:{tenantId:string,branchId:string|null,branches:any[],staff:any[],currency:string}){
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
 const now=new Date(), month=now.toLocaleString("en",{month:"long",year:"numeric"}), start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)).toISOString().slice(0,10), end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,0)).toISOString().slice(0,10);
 const [form,setForm]=useState<any>({staff_id:"",branch_id:branchId||branches[0]?.id||"",period_name:month,starts_on:start,ends_on:end,base_pay:0,variable_pay:0,bonus:0,allowances:0,deductions:0});
 const load=()=>api<any>("/api/payroll"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId]);
 const total=rows.reduce((a,r)=>a+Number(r.net_pay||0),0);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/payroll",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId})});setOpen(false);load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title="Payroll & Compensation" description="Supports fixed pay and variable teacher compensation components." actions={<Button onClick={()=>setOpen(true)}>+ Payroll entry</Button>}/>
 <div className="stats-grid compact"><StatCard label="Entries" value={rows.length}/><StatCard label="Net payroll" value={total.toLocaleString()} meta={currency}/></div>
 <div className="panel mt"><DataTable rows={rows} columns={[
  {key:"employee_no",label:"Employee"},{key:"first_name",label:"Name",render:r=><strong>{r.first_name} {r.last_name}</strong>},{key:"period_name",label:"Period"},
  {key:"base_pay",label:"Base",render:r=>Number(r.base_pay).toLocaleString()},{key:"variable_pay",label:"Variable",render:r=>Number(r.variable_pay).toLocaleString()},
  {key:"deductions",label:"Deductions",render:r=>Number(r.deductions).toLocaleString()},{key:"net_pay",label:"Net",render:r=><strong>{Number(r.net_pay).toLocaleString()}</strong>},
  {key:"status",label:"Status",render:r=><Badge tone="info">{r.status}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title="Create payroll entry">
  {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
   <Field label="Staff member"><select required value={form.staff_id} onChange={e=>setForm({...form,staff_id:e.target.value})}><option value="">Select</option>{staff.map(s=><option key={s.id} value={s.id}>{s.employee_no} — {s.first_name} {s.last_name}</option>)}</select></Field>
   <Field label="Branch"><select value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">Group / shared</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
   <Field label="Period name"><input value={form.period_name} onChange={e=>setForm({...form,period_name:e.target.value})}/></Field>
   <Field label="Base monthly pay"><input type="number" value={form.base_pay} onChange={e=>setForm({...form,base_pay:Number(e.target.value)})}/></Field>
   <Field label="Variable / % / class pay"><input type="number" value={form.variable_pay} onChange={e=>setForm({...form,variable_pay:Number(e.target.value)})}/></Field>
   <Field label="Bonus"><input type="number" value={form.bonus} onChange={e=>setForm({...form,bonus:Number(e.target.value)})}/></Field>
   <Field label="Allowances"><input type="number" value={form.allowances} onChange={e=>setForm({...form,allowances:Number(e.target.value)})}/></Field>
   <Field label="Deductions"><input type="number" value={form.deductions} onChange={e=>setForm({...form,deductions:Number(e.target.value)})}/></Field>
   <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button>Create payroll entry</Button></div>
  </form>
 </Modal></div>
}
