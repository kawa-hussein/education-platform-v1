import React,{useEffect,useMemo,useState} from "react";
import {api} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";
const tone=(s:string)=>["active","trial"].includes(s)?"good":["renewal_due","grace"].includes(s)?"warn":["suspended","cancelled"].includes(s)?"bad":"neutral";
const makePassword=()=>`Edu-${crypto.randomUUID().slice(0,8)}!${Math.floor(Math.random()*90+10)}`;

export default function CustomersPage({onChanged,onOpenTenant}:{onChanged:()=>void,onOpenTenant:(id:string)=>void}){
  const [rows,setRows]=useState<any[]>([]),[open,setOpen]=useState(false),[error,setError]=useState(""),[step,setStep]=useState(1),[busy,setBusy]=useState(false),[result,setResult]=useState<any>(null);
  const [form,setForm]=useState<any>({
    name:"",slug:"",plan_code:"trial",country:"Iraq",default_currency:"IQD",default_language:"en",timezone:"Asia/Baghdad",
    owner_name:"",owner_email:"",owner_password:makePassword(),
    create_branch:true,branch_name:"Main Campus",branch_code:"MAIN"
  });
  const load=()=>api<any>("/api/tenants").then(r=>setRows(r.rows));
  useEffect(()=>{load()},[]);
  const canNext=useMemo(()=>step===1?!!form.name:step===2?!!form.owner_name&&!!form.owner_email&&String(form.owner_password).length>=10:step===3?!form.create_branch|| (!!form.branch_name&&!!form.branch_code):true,[step,form]);
  function start(){setError("");setResult(null);setStep(1);setForm((x:any)=>({...x,name:"",slug:"",owner_name:"",owner_email:"",owner_password:makePassword(),branch_name:"Main Campus",branch_code:"MAIN",create_branch:true}));setOpen(true)}
  async function provision(){
    setBusy(true);setError("");
    try{
      const payload={
        name:form.name,slug:form.slug||undefined,plan_code:form.plan_code,country:form.country,default_currency:form.default_currency,default_language:form.default_language,timezone:form.timezone,
        initial_owner:{name:form.owner_name,email:form.owner_email,password:form.owner_password},
        initial_branch:form.create_branch?{name:form.branch_name,code:form.branch_code,type:"school"}:null
      };
      const tenantResponse=await api<any>("/api/tenants",{method:"POST",body:JSON.stringify({
        name:payload.name,slug:payload.slug,plan_code:payload.plan_code,country:payload.country,default_currency:payload.default_currency,default_language:payload.default_language,timezone:payload.timezone
      })});
      const tenantId=tenantResponse.id;
      await api("/api/users",{method:"POST",body:JSON.stringify({
        tenant_id:tenantId,branch_id:null,name:form.owner_name,email:form.owner_email,password:form.owner_password,role_code:"tenant_owner",can_delegate:true,preferred_language:form.default_language
      })});
      let branchId:string|null=null;
      if(form.create_branch){
        const branchResponse=await api<any>("/api/branches",{method:"POST",body:JSON.stringify({tenant_id:tenantId,name:form.branch_name,code:form.branch_code,type:"school"})});
        branchId=branchResponse.id;
      }
      setResult({tenant_id:tenantId,branch_id:branchId,login_url:location.origin,password:form.owner_password,email:form.owner_email});setStep(5);load();onChanged();
    }catch(e:any){setError(e.message)}finally{setBusy(false)}
  }
  const copy=(v:string)=>navigator.clipboard?.writeText(v);
  return <div>
    <PageHeader title="Customer / Tenant Directory" description="P02 · Search, provision and manage customer accounts as isolated subscription scopes." actions={<Button onClick={start}>+ Provision customer</Button>}/>
    <div className="directory-toolbar panel">
      <div className="directory-summary"><div><span>Customers</span><strong>{rows.length}</strong></div><div><span>Active / Trial</span><strong>{rows.filter(x=>["active","trial"].includes(x.status)).length}</strong></div><div><span>Renewal due</span><strong>{rows.filter(x=>x.status==="renewal_due").length}</strong></div></div>
      <div className="saved-view-chip">Default view · All customers</div>
    </div>
    <div className="panel mt">
      <DataTable rows={rows} columns={[
        {key:"name",label:"Customer",render:r=><button className="link-btn" onClick={()=>onOpenTenant(r.id)}><strong>{r.name}</strong><small>{r.slug}</small></button>},
        {key:"status",label:"Status",render:r=><Badge tone={tone(r.status) as any}>{r.status}</Badge>},
        {key:"plan_name",label:"Plan"},{key:"branch_count",label:"Branches"},{key:"student_count",label:"Students"},{key:"staff_count",label:"Staff"},
        {key:"expires_at",label:"Renewal / Expiry",render:r=>r.expires_at?new Date(r.expires_at).toLocaleDateString():"—"}
      ]}/>
    </div>

    <Modal open={open} onClose={()=>!busy&&setOpen(false)} title="Provision customer tenant" width={860}>
      <div className="wizard-steps">{["Organization","Initial Owner","First Branch","Review"].map((x,i)=><div className={`${step===i+1?"active":""} ${step>i+1?"done":""}`} key={x}><span>{step>i+1?"✓":i+1}</span><strong>{x}</strong></div>)}</div>
      {error&&<div className="alert alert-error">{error}</div>}
      {step===1&&<div className="wizard-pane"><div className="wizard-intro"><span className="eyebrow">P09 · PROVISIONING REQUEST</span><h3>Customer organization</h3><p>Create the tenant identity, commercial baseline and regional defaults.</p></div><div className="form-grid">
        <Field label="Customer / group name"><input autoFocus required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="Stable slug" hint="Optional; generated from name if blank"><input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/></Field>
        <Field label="Plan"><select value={form.plan_code} onChange={e=>setForm({...form,plan_code:e.target.value})}><option value="trial">Trial</option><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></Field>
        <Field label="Country"><input value={form.country} onChange={e=>setForm({...form,country:e.target.value})}/></Field>
        <Field label="Currency"><select value={form.default_currency} onChange={e=>setForm({...form,default_currency:e.target.value})}><option>IQD</option><option>USD</option><option>EUR</option></select></Field>
        <Field label="Language"><select value={form.default_language} onChange={e=>setForm({...form,default_language:e.target.value})}><option value="en">English</option><option value="ku">Kurdish / Sorani</option><option value="ar">Arabic</option></select></Field>
        <Field label="Timezone"><input value={form.timezone} onChange={e=>setForm({...form,timezone:e.target.value})}/></Field>
      </div></div>}
      {step===2&&<div className="wizard-pane"><div className="wizard-intro"><span className="eyebrow">P09 · INITIAL OWNER</span><h3>Create the Tenant Owner</h3><p>This is the customer's first administrative account. They sign in from the same application URL and are automatically scoped to their tenant.</p></div><div className="form-grid">
        <Field label="Owner full name"><input autoFocus required value={form.owner_name} onChange={e=>setForm({...form,owner_name:e.target.value})}/></Field>
        <Field label="Owner email"><input required type="email" value={form.owner_email} onChange={e=>setForm({...form,owner_email:e.target.value})}/></Field>
        <Field label="Temporary password" hint="Minimum 10 characters; shown once after provisioning"><input required minLength={10} value={form.owner_password} onChange={e=>setForm({...form,owner_password:e.target.value})}/></Field>
        <div className="field"><span>Password helper</span><Button type="button" variant="secondary" onClick={()=>setForm({...form,owner_password:makePassword()})}>Generate secure temporary password</Button></div>
      </div></div>}
      {step===3&&<div className="wizard-pane"><div className="wizard-intro"><span className="eyebrow">A02 · ORGANIZATION STRUCTURE</span><h3>First branch / campus</h3><p>Optionally provision the first operational branch so the customer can start configuring school data immediately.</p></div>
        <label className="toggle-row"><input type="checkbox" checked={form.create_branch} onChange={e=>setForm({...form,create_branch:e.target.checked})}/><div><strong>Create first branch now</strong><span>Recommended for school tenants</span></div></label>
        {form.create_branch&&<div className="form-grid mt"><Field label="Branch / campus name"><input autoFocus required value={form.branch_name} onChange={e=>setForm({...form,branch_name:e.target.value})}/></Field><Field label="Branch code"><input required value={form.branch_code} onChange={e=>setForm({...form,branch_code:e.target.value.toUpperCase()})}/></Field></div>}
      </div>}
      {step===4&&<div className="wizard-pane"><div className="wizard-intro"><span className="eyebrow">PROVISIONING REVIEW</span><h3>Ready to create tenant</h3><p>The provisioning action creates tenant metadata, subscription baseline, initial owner and optional first branch in one workflow.</p></div>
        <div className="review-grid"><div><span>Customer</span><strong>{form.name}</strong></div><div><span>Plan</span><strong>{form.plan_code}</strong></div><div><span>Owner</span><strong>{form.owner_name}</strong><small>{form.owner_email}</small></div><div><span>First branch</span><strong>{form.create_branch?form.branch_name:"Not created"}</strong><small>{form.create_branch?form.branch_code:"Customer will configure later"}</small></div><div><span>Locale</span><strong>{form.country} · {form.default_currency}</strong><small>{form.timezone}</small></div><div><span>Login</span><strong>{location.origin}</strong><small>Shared secure login entry point</small></div></div>
      </div>}
      {step===5&&result&&<div className="provision-success"><div className="success-mark">✓</div><h3>Customer tenant is ready</h3><p>The customer can now sign in with the Tenant Owner account below.</p><div className="credential-card"><div><span>Login URL</span><strong>{result.login_url||location.origin}</strong><button onClick={()=>copy(result.login_url||location.origin)}>Copy</button></div><div><span>Email</span><strong>{result.email}</strong><button onClick={()=>copy(result.email)}>Copy</button></div><div><span>Temporary password</span><strong>{result.password}</strong><button onClick={()=>copy(result.password)}>Copy</button></div></div><div className="provision-warning">Store or send the temporary password securely. The platform does not store the readable password.</div><div className="form-actions"><Button variant="secondary" onClick={()=>setOpen(false)}>Close</Button><Button onClick={()=>{setOpen(false);onOpenTenant(result.tenant_id)}}>Open Customer 360</Button></div></div>}
      {step<5&&<div className="wizard-actions"><Button type="button" variant="secondary" disabled={step===1||busy} onClick={()=>setStep(step-1)}>Back</Button><div><span>Step {step} of 4</span>{step<4?<Button type="button" disabled={!canNext} onClick={()=>setStep(step+1)}>Continue</Button>:<Button type="button" disabled={!canNext||busy} onClick={provision}>{busy?"Provisioning…":"Provision tenant"}</Button>}</div></div>}
    </Modal>
  </div>
}
