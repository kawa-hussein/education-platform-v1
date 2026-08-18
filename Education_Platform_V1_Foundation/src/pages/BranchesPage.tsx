import React,{useEffect,useState} from "react";
import {api,qs} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
export default function BranchesPage({tenantId,onChanged}:{tenantId:string,onChanged:()=>void}){
 const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
 const [form,setForm]=useState<any>({name:"",code:"",type:"school",city:"",phone:"",email:""});
 const load=()=>api<any>("/api/branches"+qs({tenant_id:tenantId})).then(r=>setRows(r.rows));
 useEffect(()=>{load()},[tenantId]);
 async function create(e:React.FormEvent){e.preventDefault();try{await api("/api/branches",{method:"POST",body:JSON.stringify({...form,tenant_id:tenantId})});setOpen(false);setForm({...form,name:"",code:""});load();onChanged()}catch(e:any){setError(e.message)}}
 return <div><PageHeader title="Branches / Campuses" description="Local school units inside this education group." actions={<Button onClick={()=>setOpen(true)}>+ Add branch</Button>}/>
 <div className="panel"><DataTable rows={rows} columns={[
   {key:"name",label:"Branch",render:r=><div><strong>{r.name}</strong><small className="cell-sub">{r.code}</small></div>},
   {key:"type",label:"Type",render:r=><Badge tone="info">{r.type}</Badge>},{key:"city",label:"City"},
   {key:"student_count",label:"Students"},{key:"staff_count",label:"Staff"},{key:"status",label:"Status",render:r=><Badge tone="good">{r.status}</Badge>}
 ]}/></div>
 <Modal open={open} onClose={()=>setOpen(false)} title="Add school branch">
  {error&&<div className="alert alert-error">{error}</div>}<form onSubmit={create} className="form-grid">
   <Field label="Branch name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
   <Field label="Branch code"><input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></Field>
   <Field label="Type"><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="school">School</option><option value="campus">Campus</option><option value="academy">Academy</option><option value="university">University</option></select></Field>
   <Field label="City"><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></Field>
   <Field label="Phone"><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></Field>
   <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
   <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button>Add branch</Button></div>
  </form>
 </Modal></div>
}
