import React,{useEffect,useState} from "react";
import {api} from "../lib/api";
import {Button,Field} from "../components/ui";
import {useI18n} from "../lib/i18nContext";
import type {Lang} from "../lib/i18n";

export default function AuthPage({onReady}:{onReady:()=>void}){
  const {lang,setLang,t}=useI18n();
  const [needsBootstrap,setNeedsBootstrap]=useState<boolean|null>(null),[form,setForm]=useState({name:"",email:"",password:""}),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  useEffect(()=>{api<any>("/api/bootstrap/status").then(r=>setNeedsBootstrap(r.needs_bootstrap)).catch(e=>setError(e.message))},[]);
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{if(needsBootstrap)await api("/api/bootstrap",{method:"POST",body:JSON.stringify(form)});else await api("/api/auth/login",{method:"POST",body:JSON.stringify({email:form.email,password:form.password})});onReady()}catch(e:any){setError(e.message)}finally{setBusy(false)}}
  return <div className="auth-screen" dir={lang==="ku"||lang==="ar"?"rtl":"ltr"}>
    <div className="auth-panel">
      <div className="auth-language"><select aria-label={t("language")} value={lang} onChange={e=>setLang(e.target.value as Lang)}><option value="en">English</option><option value="ku">کوردی</option><option value="ar">العربية</option><option value="tr">Türkçe</option></select></div>
      <div className="auth-brand"><div className="brand-mark large">E</div><div><h1>Education Platform</h1><p>Enterprise V6 · SaaS</p></div></div>
      <div className="auth-copy"><span className="eyebrow">{needsBootstrap?t("firstSetup"):t("secureSignIn")}</span><h2>{needsBootstrap?t("createFirstOwner"):t("welcomeBack")}</h2><p>{needsBootstrap?t("setupHelp"):t("signInHelp")}</p></div>
      {error&&<div className="alert alert-error">{error}</div>}
      <form onSubmit={submit} className="form-stack">{needsBootstrap&&<Field label={t("fullName")}><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></Field>}<Field label={t("email")}><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></Field><Field label={t("password")} hint={needsBootstrap?t("minimum10"):undefined}><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength={needsBootstrap?10:1} required/></Field><Button disabled={busy||needsBootstrap===null}>{busy?t("pleaseWait"):needsBootstrap?t("initializePlatform"):t("signIn")}</Button></form>
    </div>
    <div className="auth-visual"><div className="visual-grid"></div><div className="visual-card v1"><strong>{t("providerControl")}</strong><span>{t("tenantsPlansRenewals")}</span></div><div className="visual-card v2"><strong>{t("schoolGroups")}</strong><span>{t("branchesManagersUsers")}</span></div><div className="visual-card v3"><strong>{t("operations")}</strong><span>{t("studentsAttendanceFinance")}</span></div><div className="visual-orbit"></div></div>
  </div>
}
