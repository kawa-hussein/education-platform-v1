import React,{useEffect,useState} from "react";
import {api} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
const tone=(s:string)=>["active","trial"].includes(s)?"good":["renewal_due","grace"].includes(s)?"warn":["suspended","cancelled"].includes(s)?"bad":"neutral";
export default function CustomersPage({onChanged,onOpenTenant}:{onChanged:()=>void,onOpenTenant:(id:string)=>void}){
  const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState("");
  const [form,setForm]=useState<any>({name:"",slug:"",plan_code:"trial",country:"Iraq",default_currency:"IQD",default_language:"en"});
  const load=()=>api<any>("/api/tenants").then(r=>setRows(r.rows));
  useEffect(()=>{load()},[]);
  async function create(e:React.FormEvent){e.preventDefault();setError("");try{await api("/api/tenants",{method:"POST",body:JSON.stringify(form)});setOpen(false);setForm({...form,name:"",slug:""});load();onChanged();}catch(e:any){setError(e.message)}}
  return <div><PageHeader title="Customers / Tenants" description="Each customer is an isolated subscription and education-group scope." actions={<Button onClick={()=>setOpen(true)}>+ New customer</Button>}/>
    <div className="panel">
      <DataTable rows={rows} columns={[
        {key:"name",label:"Customer",render:r=><button className="link-btn" onClick={()=>onOpenTenant(r.id)}><strong>{r.name}</strong><small>{r.slug}</small></button>},
        {key:"status",label:"Status",render:r=><Badge tone={tone(r.status) as any}>{r.status}</Badge>},
        {key:"plan_name",label:"Plan"},
        {key:"branch_count",label:"Branches"},
        {key:"student_count",label:"Students"},
        {key:"staff_count",label:"Staff"},
        {key:"expires_at",label:"Expires",render:r=>r.expires_at?new Date(r.expires_at).toLocaleDateString():"—"}
      ]}/>
    </div>
    <Modal open={open} onClose={()=>setOpen(false)} title="Create customer tenant">
      {error&&<div className="alert alert-error">{error}</div>}
      <form onSubmit={create} className="form-grid">
        <Field label="Customer / group name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="Slug" hint="Optional; used as a stable identifier"><input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/></Field>
        <Field label="Plan"><select value={form.plan_code} onChange={e=>setForm({...form,plan_code:e.target.value})}><option value="trial">Trial</option><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></Field>
        <Field label="Country"><input value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></Field>
        <Field label="Currency"><select value={form.default_currency} onChange={e=>setForm({...form,default_currency:e.target.value})}><option>IQD</option><option>USD</option><option>EUR</option></select></Field>
        <Field label="Language"><select value={form.default_language} onChange={e=>setForm({...form,default_language:e.target.value})}><option value="en">English</option><option value="ku">Kurdish</option><option value="ar">Arabic</option></select></Field>
        <div className="form-actions span-2"><Button variant="secondary" type="button" onClick={()=>setOpen(false)}>Cancel</Button><Button>Create tenant</Button></div>
      </form>
    </Modal>
  </div>
}
