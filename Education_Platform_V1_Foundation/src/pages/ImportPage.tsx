import React,{useMemo,useState} from "react";
import * as XLSX from "xlsx";
import {api} from "../lib/api";
import {Badge,Button,DataTable,Field,PageHeader} from "../components/ui";

export default function ImportPage({tenantId,branchId,branches}:{tenantId:string,branchId:string|null,branches:any[]}){
 const [rows,setRows]=useState<any[]>([]),[filename,setFilename]=useState(""),[targetBranch,setTargetBranch]=useState(branchId||branches[0]?.id||""),[result,setResult]=useState<any>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function choose(file:File){
   setError("");setResult(null);setFilename(file.name);
   try{
    const buf=await file.arrayBuffer(); const wb=XLSX.read(buf,{type:"array",cellDates:false}); const ws=wb.Sheets[wb.SheetNames[0]];
    const data=XLSX.utils.sheet_to_json(ws,{defval:""}); setRows(data.slice(0,2000) as any[]);
   }catch(e:any){setError("Could not read this Excel/CSV file: "+e.message)}
 }
 async function run(){if(!targetBranch)return setError("Select a target branch.");setBusy(true);setError("");try{
   const r=await api<any>("/api/import/students",{method:"POST",body:JSON.stringify({tenant_id:tenantId,branch_id:targetBranch,filename,rows})});setResult(r);
 }catch(e:any){setError(e.message)}finally{setBusy(false)}}
 const cols=useMemo(()=>rows.length?Object.keys(rows[0]).slice(0,8).map(k=>({key:k,label:k})):[],[rows]);
 return <div><PageHeader title="Excel / CSV Import" description="Upload existing school data, preview it, then import it into the correct tenant and branch."/>
 <div className="grid-2">
  <section className="panel"><h3>1. Select source file</h3><p className="muted-text">Student import currently recognizes Student ID/Student No, Student Name/First Name, Last Name, Date of Birth, Gender, Email and Phone.</p>
   <div className="dropzone"><input type="file" accept=".xlsx,.xls,.csv" onChange={e=>e.target.files?.[0]&&choose(e.target.files[0])}/><strong>{filename||"Choose Excel or CSV"}</strong><span>Maximum 2,000 rows per starter batch</span></div>
   <Field label="Target branch"><select value={targetBranch} onChange={e=>setTargetBranch(e.target.value)}><option value="">Select branch</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
   <Button disabled={!rows.length||busy} onClick={run}>{busy?"Importing…":`Import ${rows.length||0} rows`}</Button>
   {error&&<div className="alert alert-error mt-sm">{error}</div>}
   {result&&<div className="import-result"><Badge tone="good">Completed</Badge><strong>{result.imported} imported</strong><span>{result.errors?.length||0} validation errors</span></div>}
  </section>
  <section className="panel"><h3>2. Import controls</h3><div className="check-list"><span>✓ Tenant / branch scope required</span><span>✓ Duplicate student number protection</span><span>✓ Validation errors returned before review</span><span>✓ Import job recorded</span><span>✓ Full audit event created</span></div></section>
 </div>
 {rows.length>0&&<div className="panel mt"><div className="panel-head"><h3>Preview</h3><Badge tone="info">{rows.length} rows</Badge></div><DataTable rows={rows.slice(0,25)} columns={cols}/>{rows.length>25&&<div className="table-note">Showing first 25 rows.</div>}</div>}
 </div>
}
