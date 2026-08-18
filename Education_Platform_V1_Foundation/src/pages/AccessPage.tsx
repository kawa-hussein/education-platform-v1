import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
const roles=["tenant_owner","group_admin","central_director","school_admin","branch_manager","academic_manager","finance_manager","hr_manager","admissions_manager","department_manager","teacher","staff","viewer"];
export default function AccessPage({tenantId,branchId,branches}:{tenantId:string,branchId:string|null,branches:any[]}){
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
 const [form,setForm]=useState<any>({name:"",email:"",password:"",role_code:"viewer",branch_id:branchId||"",can_delegate:false,preferred_language:"en"});
 const load=()=>api<any>("/api/users"+qs({tenant_id:tenantId,branch_id:branchId})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId,branchId]);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/users",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId,branch_id:form.branch_id||null})});setOpen(false);load()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title="Users & Delegated Access" description="Role assignments carry tenant/branch scope and cannot escalate above the delegator." actions={<Button onClick={()=>setOpen(true)}>+ Create user</Button>}/>
 <div className="panel"><DataTable rows={rows} columns={[
  {key:"name",label:"User",render:r=><div><strong>{r.name}</strong><small className="cell-sub">{r.email}</small></div>},
  {key:"assignments",label:"Roles",render:r=><div className="chips">{(r.assignments||[]).map((a:any)=><Badge key={a.id} tone="info">{a.role_code.replaceAll("_"," ")}{a.branch_id?" · branch":""}</Badge>)}</div>},
  {key:"status",label:"Status",render:r=><Badge tone="good">{r.status}</Badge>},{key:"created_at",label:"Created",render:r=>new Date(r.created_at).toLocaleDateString()}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title="Create scoped user">
 {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
  <Field label="Full name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
  <Field label="Email"><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
  <Field label="Temporary password" hint="Minimum 10 characters"><input required minLength={10} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></Field>
  <Field label="Role"><select value={form.role_code} onChange={e=>setForm({...form,role_code:e.target.value})}>{roles.map(r=><option key={r} value={r}>{r.replaceAll("_"," ")}</option>)}</select></Field>
  <Field label="Scope branch" hint="Leave blank for group scope if your role permits it"><select value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">Group / all allowed branches</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
  <Field label="Language"><select value={form.preferred_language} onChange={e=>setForm({...form,preferred_language:e.target.value})}><option value="en">English</option><option value="ku">Kurdish</option><option value="ar">Arabic</option></select></Field>
  <label className="check-field span-2"><input type="checkbox" checked={form.can_delegate} onChange={e=>setForm({...form,can_delegate:e.target.checked})}/><span>Allow this manager to delegate lower roles inside this scope</span></label>
  <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button>Create user</Button></div>
 </form></Modal></div>
}
