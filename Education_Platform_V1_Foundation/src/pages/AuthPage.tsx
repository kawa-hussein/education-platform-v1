import React,{useEffect,useState} from "react";
import { api } from "../lib/api";
import { Button,Field } from "../components/ui";

export default function AuthPage({onReady}:{onReady:()=>void}){
  const [needsBootstrap,setNeedsBootstrap]=useState<boolean|null>(null);
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{api<any>("/api/bootstrap/status").then(r=>setNeedsBootstrap(r.needs_bootstrap)).catch(e=>setError(e.message))},[]);
  async function submit(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError("");
    try{
      if(needsBootstrap) await api("/api/bootstrap",{method:"POST",body:JSON.stringify(form)});
      else await api("/api/auth/login",{method:"POST",body:JSON.stringify({email:form.email,password:form.password})});
      onReady();
    }catch(e:any){setError(e.message)}finally{setBusy(false)}
  }
  return <div className="auth-screen">
    <div className="auth-panel">
      <div className="auth-brand"><div className="brand-mark large">E</div><div><h1>Education Platform</h1><p>Multi-tenant SaaS • Multi-branch • Cloudflare-ready</p></div></div>
      <div className="auth-copy">
        <span className="eyebrow">{needsBootstrap?"FIRST-TIME SETUP":"SECURE SIGN IN"}</span>
        <h2>{needsBootstrap?"Create the first Platform Owner":"Welcome back"}</h2>
        <p>{needsBootstrap?"This account controls the SaaS provider side. Customer school accounts are created separately.":"Sign in to your authorized workspace."}</p>
      </div>
      {error&&<div className="alert alert-error">{error}</div>}
      <form onSubmit={submit} className="form-stack">
        {needsBootstrap&&<Field label="Full name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></Field>}
        <Field label="Email"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></Field>
        <Field label="Password" hint={needsBootstrap?"Minimum 10 characters":undefined}><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength={needsBootstrap?10:1} required/></Field>
        <Button disabled={busy||needsBootstrap===null}>{busy?"Please wait…":needsBootstrap?"Initialize platform":"Sign in"}</Button>
      </form>
      <div className="auth-note">Passwords are hashed with PBKDF2 and sessions use HttpOnly cookies. Tenant and branch scopes are enforced by the API.</div>
    </div>
    <div className="auth-visual">
      <div className="visual-grid"></div>
      <div className="visual-card v1"><strong>Provider Control</strong><span>Tenants • Plans • Renewals</span></div>
      <div className="visual-card v2"><strong>School Groups</strong><span>Branches • Managers • Users</span></div>
      <div className="visual-card v3"><strong>Operations</strong><span>Students • Attendance • Finance</span></div>
      <div className="visual-orbit"></div>
    </div>
  </div>
}
