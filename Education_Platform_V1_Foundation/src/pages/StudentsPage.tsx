import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
export default function StudentsPage({tenantId,branchId,branches}:{tenantId:string,branchId:string|null,branches:any[]}){
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[q,setQ]=useState(""),[error,setError]=useState("");
 const [form,setForm]=useState<any>({student_no:"",first_name:"",last_name:"",branch_id:branchId||branches[0]?.id||"",gender:"",date_of_birth:"",email:"",phone:""});
 const load=()=>api<any>("/api/students"+qs({tenant_id:tenantId,branch_id:branchId,q})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId]);
 useEffect(()=>{if(branchId)setForm((x:any)=>({...x,branch_id:branchId}))},[branchId]);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/students",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId})});setOpen(false);setForm({...form,student_no:"",first_name:"",last_name:""});load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title="Students" description="Canonical student records scoped to tenant and branch." actions={<Button onClick={()=>setOpen(true)}>+ Add student</Button>}/>
 <div className="toolbar"><input placeholder="Search student number or name…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")load()}}/><Button variant="secondary" onClick={load}>Search</Button></div>
 <div className="panel"><DataTable rows={rows} columns={[
  {key:"student_no",label:"Student #"}, {key:"first_name",label:"Student",render:r=><div><strong>{r.first_name} {r.last_name}</strong><small className="cell-sub">{r.email||r.phone||""}</small></div>},
  {key:"branch_name",label:"Branch"},{key:"grade_name",label:"Grade"},{key:"class_name",label:"Class"},
  {key:"status",label:"Status",render:r=><Badge tone={r.status==="active"?"good":"neutral"}>{r.status}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title="Create student record">
  {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
   <Field label="Student number"><input required value={form.student_no} onChange={e=>setForm({...form,student_no:e.target.value})}/></Field>
   <Field label="Branch"><select required value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">Select branch</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
   <Field label="First name"><input required value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/></Field>
   <Field label="Last name"><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/></Field>
   <Field label="Date of birth"><input type="date" value={form.date_of_birth} onChange={e=>setForm({...form,date_of_birth:e.target.value})}/></Field>
   <Field label="Gender"><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="">Not specified</option><option>Male</option><option>Female</option></select></Field>
   <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
   <Field label="Phone"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
   <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button>Create student</Button></div>
  </form>
 </Modal></div>
}
