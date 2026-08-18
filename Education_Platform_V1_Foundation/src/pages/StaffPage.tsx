import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
export default function StaffPage({tenantId,branchId,branches}:{tenantId:string,branchId:string|null,branches:any[]}){
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
 const [form,setForm]=useState<any>({employee_no:"",first_name:"",last_name:"",branch_id:branchId||branches[0]?.id||"",job_title:"",email:"",phone:"",assignment_type:"employee"});
 const load=()=>api<any>("/api/staff"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId]);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/staff",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId})});setOpen(false);setForm({...form,employee_no:"",first_name:"",last_name:""});load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title="Staff & Teachers" description="One staff record can hold assignments across multiple branches." actions={<Button onClick={()=>setOpen(true)}>+ Add staff</Button>}/>
 <div className="panel"><DataTable rows={rows} columns={[
  {key:"employee_no",label:"Employee #"}, {key:"first_name",label:"Name",render:r=><div><strong>{r.first_name} {r.last_name}</strong><small className="cell-sub">{r.email||""}</small></div>},
  {key:"job_title",label:"Job title"},{key:"assignments",label:"Assignments",render:r=><div className="chips">{(r.assignments||[]).map((a:any)=><Badge key={a.id} tone="info">{a.branch_name||"Group"} · {a.assignment_type}</Badge>)}</div>},
  {key:"employment_status",label:"Status",render:r=><Badge tone="good">{r.employment_status}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title="Add staff member">
 {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
  <Field label="Employee number"><input required value={form.employee_no} onChange={e=>setForm({...form,employee_no:e.target.value})}/></Field>
  <Field label="Branch"><select required value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">Select branch</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
  <Field label="First name"><input required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/></Field>
  <Field label="Last name"><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/></Field>
  <Field label="Job title"><input value={form.job_title} onChange={e=>setForm({...form,job_title:e.target.value})}/></Field>
  <Field label="Assignment type"><select value={form.assignment_type} onChange={e=>setForm({...form,assignment_type:e.target.value})}><option value="employee">Employee</option><option value="teacher">Teacher</option><option value="manager">Manager</option><option value="instructor">Instructor</option></select></Field>
  <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
  <Field label="Phone"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
  <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button>Add staff</Button></div>
 </form></Modal></div>
}
