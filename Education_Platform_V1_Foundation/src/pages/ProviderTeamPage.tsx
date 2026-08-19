import React,{useEffect,useMemo,useState} from "react";
import {api} from "../lib/api";
import {Badge,Button,DataTable,Field,Modal,PageHeader} from "../components/ui";

type Role={code:string;name:string;description:string;permissions:string[]};
type Permission={code:string;group:string;name:string};
const makePassword=()=>`Edu-${crypto.randomUUID().slice(0,8)}!${Math.floor(Math.random()*90+10)}`;
const tone=(s:string)=>s==="active"||s==="accepted"?"good":s==="pending"?"warn":s==="suspended"||s==="revoked"||s==="expired"?"bad":"neutral";

export default function ProviderTeamPage(){
 const [team,setTeam]=useState<any[]>([]),[invites,setInvites]=useState<any[]>([]),[roles,setRoles]=useState<Role[]>([]),[permissions,setPermissions]=useState<Permission[]>([]),[currentPermissions,setCurrentPermissions]=useState<string[]>([]),[currentUserId,setCurrentUserId]=useState("");
 const [tab,setTab]=useState<"team"|"invites"|"roles">("team"),[open,setOpen]=useState(false),[edit,setEdit]=useState<any>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[result,setResult]=useState<any>(null);
 const [mode,setMode]=useState<"invite"|"direct">("invite"),[permissionMode,setPermissionMode]=useState<"role"|"custom">("role");
 const [form,setForm]=useState<any>({name:"",email:"",role_code:"provider_owner",preferred_language:"en",password:makePassword(),status:"active"});
 const [selected,setSelected]=useState<Set<string>>(new Set());
 const canManage=currentPermissions.includes("provider.team.manage")||currentPermissions.includes("provider.owner.manage");
 const canManageOwners=currentPermissions.includes("provider.owner.manage");
 const load=async()=>{
  const [t,r]=await Promise.all([api<any>("/api/provider/team"),api<any>("/api/provider/roles")]);
  setTeam(t.rows||[]);setInvites(t.invitations||[]);setCurrentPermissions(t.current_permissions||[]);setCurrentUserId(t.current_user_id||"");setRoles(r.roles||[]);setPermissions(r.permissions||[]);
 };
 useEffect(()=>{load().catch(e=>setError(e.message))},[]);
 const role=useMemo(()=>roles.find(r=>r.code===form.role_code),[roles,form.role_code]);
 useEffect(()=>{if(permissionMode==="role")setSelected(new Set(role?.permissions||[]))},[role?.code,permissionMode]);
 const grouped=useMemo(()=>Object.entries(permissions.reduce((a:Record<string,Permission[]>,p)=>{(a[p.group]??=[]).push(p);return a},{})),[permissions]);
 function computeOverrides(){
  if(permissionMode==="role")return {};
  const defaults=new Set(role?.permissions||[]),out:Record<string,"allow"|"deny">={};
  for(const p of permissions){const wanted=selected.has(p.code),base=defaults.has(p.code);if(wanted!==base)out[p.code]=wanted?"allow":"deny";}
  return out;
 }
 function start(){setEdit(null);setError("");setResult(null);setMode("invite");setPermissionMode("role");setForm({name:"",email:"",role_code:"provider_owner",preferred_language:"en",password:makePassword(),status:"active"});setOpen(true)}
 function startEdit(row:any){
  const r=roles.find(x=>x.code===row.role_code);const effective=new Set(r?.permissions||[]);for(const o of row.permission_overrides||[]){if(o.effect==="allow")effective.add(o.permission_code);else effective.delete(o.permission_code)}
  setEdit(row);setError("");setResult(null);setMode("direct");setForm({name:row.name,email:row.email,role_code:row.role_code,preferred_language:row.preferred_language||"en",password:"",status:row.status});setSelected(effective);setPermissionMode((row.permission_overrides||[]).length?"custom":"role");setOpen(true);
 }
 const toggle=(code:string)=>setSelected(s=>{const n=new Set(s);n.has(code)?n.delete(code):n.add(code);return n});
 async function submit(){
  setBusy(true);setError("");setResult(null);
  try{
   if(edit){
    await api(`/api/provider/team/users/${edit.id}`,{method:"PATCH",body:JSON.stringify({role_code:form.role_code,status:form.status,permission_overrides:computeOverrides()})});
    setOpen(false);await load();return;
   }
   if(mode==="invite"){
    const r=await api<any>("/api/provider/team/invitations",{method:"POST",body:JSON.stringify({name:form.name,email:form.email,role_code:form.role_code,permission_overrides:computeOverrides()})});
    setResult({kind:"invite",url:r.invite_url,expires_at:r.expires_at,email:form.email});await load();
   }else{
    const r=await api<any>("/api/provider/team/users",{method:"POST",body:JSON.stringify({name:form.name,email:form.email,password:form.password,role_code:form.role_code,preferred_language:form.preferred_language,permission_overrides:computeOverrides()})});
    setResult({kind:"direct",url:r.login_url,email:form.email,password:form.password});await load();
   }
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 async function revoke(id:string){if(!confirm("Revoke this invitation?"))return;try{await api(`/api/provider/team/invitations/${id}/revoke`,{method:"POST"});await load()}catch(e:any){setError(e.message)}}
 async function quickStatus(row:any,status:string){try{await api(`/api/provider/team/users/${row.id}`,{method:"PATCH",body:JSON.stringify({status})});await load()}catch(e:any){setError(e.message)}}
 const copy=(v:string)=>navigator.clipboard?.writeText(v);
 const roleOptions=roles.filter(r=>r.code!=="platform_owner"&&(canManageOwners||r.code!=="provider_owner"));
 return <div className="provider-team-page">
  <PageHeader title="Provider Team & Access" description="P29 · Internal provider users, roles, permissions, invitations and segregation of duties." actions={canManage?<Button onClick={start}>+ Add provider user</Button>:undefined}/>
  {error&&<div className="alert alert-error">{error}</div>}
  <div className="provider-team-hero">
   <div><span className="eyebrow">PROVIDER CONTROL PLANE</span><h2>One account per person. No shared owner passwords.</h2><p>Add partners and employees with their own login, assign a standard role, then optionally narrow or expand specific permissions. Every change is recorded in provider audit.</p></div>
   <div className="provider-team-metrics"><div><span>Active team</span><strong>{team.filter(x=>x.status==="active").length}</strong></div><div><span>Pending invites</span><strong>{invites.filter(x=>x.status==="pending").length}</strong></div><div><span>Role templates</span><strong>{roles.filter(x=>x.code!=="platform_owner").length}</strong></div></div>
  </div>
  <div className="workspace-tabs provider-tabs"><button className={tab==="team"?"active":""} onClick={()=>setTab("team")}>Team</button><button className={tab==="invites"?"active":""} onClick={()=>setTab("invites")}>Invitations</button><button className={tab==="roles"?"active":""} onClick={()=>setTab("roles")}>Roles & Permissions</button></div>
  {tab==="team"&&<div className="panel">
   <DataTable rows={team} columns={[
    {key:"name",label:"Provider user",render:r=><div><strong>{r.name}</strong><small className="cell-sub">{r.email}{r.id===currentUserId?" · You":""}</small></div>},
    {key:"role_name",label:"Role",render:r=><div><strong>{r.role_name}</strong><small className="cell-sub">{r.role_code}</small></div>},
    {key:"status",label:"Status",render:r=><Badge tone={tone(r.status) as any}>{r.status}</Badge>},
    {key:"permission_overrides",label:"Permissions",render:r=><span>{(r.permission_overrides||[]).length?`${r.permission_overrides.length} custom override(s)`:"Role defaults"}</span>},
    {key:"created_at",label:"Added",render:r=>new Date(r.created_at).toLocaleDateString()},
    {key:"actions",label:"Actions",render:r=><div className="row-actions"><Button variant="ghost" onClick={()=>startEdit(r)} disabled={!canManage}>Edit</Button>{r.id!==currentUserId&&canManage&&(r.status==="active"?<Button variant="ghost" onClick={()=>quickStatus(r,"suspended")}>Suspend</Button>:<Button variant="ghost" onClick={()=>quickStatus(r,"active")}>Activate</Button>)}</div>}
   ]}/>
  </div>}
  {tab==="invites"&&<div className="panel"><DataTable rows={invites} empty="No provider invitations" columns={[
   {key:"name",label:"Invitee",render:r=><div><strong>{r.name}</strong><small className="cell-sub">{r.email}</small></div>},{key:"role_code",label:"Role",render:r=>roles.find(x=>x.code===r.role_code)?.name||r.role_code},{key:"status",label:"Status",render:r=><Badge tone={tone(r.status) as any}>{r.status}</Badge>},{key:"expires_at",label:"Expires",render:r=>new Date(r.expires_at).toLocaleString()},{key:"created_by_name",label:"Invited by"},{key:"action",label:"",render:r=>r.status==="pending"&&canManage?<Button variant="ghost" onClick={()=>revoke(r.id)}>Revoke</Button>:"—"}
  ]}/></div>}
  {tab==="roles"&&<div className="role-catalog-grid">{roles.filter(r=>r.code!=="platform_owner").map(r=><section className="panel role-card" key={r.code}><div className="panel-head"><div><span className="nav-code">{r.code}</span><h3>{r.name}</h3></div><Badge tone={r.code==="provider_owner"?"info":"neutral"}>{r.permissions.length} permissions</Badge></div><p>{r.description}</p><div className="role-permission-list">{r.permissions.map(p=><span key={p}>{permissions.find(x=>x.code===p)?.name||p}</span>)}</div></section>)}</div>}

  <Modal open={open} onClose={()=>!busy&&setOpen(false)} title={edit?"Edit provider access":"Add provider user"} width={920}>
   {result?<div className="provider-access-success"><div className="success-mark">✓</div><h3>{result.kind==="invite"?"Invitation link is ready":"Provider account is ready"}</h3><p>{result.kind==="invite"?"Send this private link to the person. They will choose their own password and activate the approved role.":"Send the login details securely. The readable temporary password is shown only here."}</p><div className="credential-card"><div><span>{result.kind==="invite"?"Invitation URL":"Login URL"}</span><strong>{result.url}</strong><button onClick={()=>copy(result.url)}>Copy</button></div><div><span>Email</span><strong>{result.email}</strong><button onClick={()=>copy(result.email)}>Copy</button></div>{result.password&&<div><span>Temporary password</span><strong>{result.password}</strong><button onClick={()=>copy(result.password)}>Copy</button></div>}</div>{result.expires_at&&<div className="provision-warning">Invitation expires {new Date(result.expires_at).toLocaleString()}.</div>}<div className="form-actions"><Button onClick={()=>setOpen(false)}>Done</Button></div></div>:<>
    {error&&<div className="alert alert-error">{error}</div>}
    {!edit&&<div className="account-mode-switch"><button className={mode==="invite"?"active":""} onClick={()=>setMode("invite")}><strong>Invite link</strong><span>Recommended · person sets own password</span></button><button className={mode==="direct"?"active":""} onClick={()=>setMode("direct")}><strong>Create account now</strong><span>You set a temporary password</span></button></div>}
    <div className="form-grid mt">
     <Field label="Full name"><input value={form.name} disabled={!!edit} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
     <Field label="Email"><input type="email" value={form.email} disabled={!!edit} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
     <Field label="Provider role"><select value={form.role_code} onChange={e=>{setForm({...form,role_code:e.target.value});setPermissionMode("role")}}>{roleOptions.map(r=><option key={r.code} value={r.code}>{r.name}</option>)}</select></Field>
     <Field label="Language"><select value={form.preferred_language} disabled={!!edit} onChange={e=>setForm({...form,preferred_language:e.target.value})}><option value="en">English</option><option value="ku">Kurdish / Sorani</option><option value="ar">Arabic</option></select></Field>
     {edit&&<Field label="Account status"><select value={form.status} disabled={edit.id===currentUserId} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="suspended">Suspended</option><option value="disabled">Disabled</option></select></Field>}
     {!edit&&mode==="direct"&&<Field label="Temporary password" hint="Minimum 10 characters"><div className="input-action"><input value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button type="button" onClick={()=>setForm({...form,password:makePassword()})}>Generate</button></div></Field>}
    </div>
    <div className="permission-mode mt"><div><strong>Permission model</strong><span>Start from the selected role template, or customize specific capabilities for this person.</span></div><div><button className={permissionMode==="role"?"active":""} onClick={()=>setPermissionMode("role")}>Role defaults</button><button className={permissionMode==="custom"?"active":""} onClick={()=>{setPermissionMode("custom");setSelected(new Set(role?.permissions||[]))}}>Custom permissions</button></div></div>
    {permissionMode==="custom"&&<div className="permission-matrix">{grouped.map(([group,items])=><section key={group}><h4>{group}</h4>{items.map(p=><label key={p.code}><input type="checkbox" checked={selected.has(p.code)} onChange={()=>toggle(p.code)} disabled={p.code==="provider.owner.manage"&&!canManageOwners}/><span><strong>{p.name}</strong><small>{p.code}</small></span></label>)}</section>)}</div>}
    <div className="provider-sod-note"><strong>Segregation of duties</strong><span>Provider Owners can grant owner authority. Other administrators cannot elevate themselves or another user to Provider Owner. Suspended users have all active sessions revoked.</span></div>
    <div className="form-actions"><Button variant="secondary" onClick={()=>setOpen(false)} disabled={busy}>Cancel</Button><Button onClick={submit} disabled={busy||(!edit&&(!form.name||!form.email))||(!edit&&mode==="direct"&&String(form.password).length<10)}>{busy?"Saving…":edit?"Save access":"Create / invite user"}</Button></div>
   </>}
  </Modal>
 </div>
}
