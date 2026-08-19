import React,{useEffect,useState} from "react";
import {api} from "../lib/api";
import {PageHeader,StatCard,Badge,Button} from "../components/ui";
import {useI18n} from "../lib/i18nContext";

export default function ProviderDashboard({onNavigate}:{onNavigate?:(page:string)=>void}){
  const {lang}=useI18n();
  const [s,setS]=useState<any>(null);
  useEffect(()=>{api<any>("/api/provider/summary").then(r=>setS(r.summary)).catch(()=>{})},[]);
  const c=(en:string,ku:string,ar:string,tr:string)=>lang==="ku"?ku:lang==="ar"?ar:lang==="tr"?tr:en;
  const actions=[
    [c("Renewals requiring action","نوێکردنەوە پێویستی بە کردار هەیە","تجديدات تتطلب إجراءً","İşlem gerektiren yenilemeler"),s?.renewals_due??0,"P06"],
    [c("Tenants awaiting provisioning","کڕیارانی چاوەڕوانی ئامادەکردنی ژینگە","عملاء بانتظار التجهيز","Hazırlama bekleyen müşteriler"),0,"P09"],
    [c("Implementations at risk","جێبەجێکردنە مەترسیدارەکان","تنفيذات معرضة للخطر","Risk altındaki kurulumlar"),0,"P10"],
    [c("Support escalations","کەیسە بەرزکراوەکانی پشتگیری","تصعيدات الدعم","Destek eskalasyonları"),0,"P13"],
    [c("Security approvals","پەسەندکردنەکانی ئاسایش","موافقات الأمن","Güvenlik onayları"),0,"P18"],
    [c("Release approvals","پەسەندکردنی بڵاوکردنەوەکان","موافقات الإصدارات","Sürüm onayları"),0,"P17"]
  ];
  return <div className="control-tower">
    <PageHeader title={c("Provider Executive Control Tower","ناوەندی کۆنترۆڵی بەڕێوەبەری پلاتفۆرم","مركز التحكم التنفيذي للمزوّد","Sağlayıcı Yönetici Kontrol Merkezi")} description={c("P01 · Global commercial, customer, operational and governance view for the SaaS provider.","P01 · دیمەنی گشتیی بازرگانی، کڕیاران، کارپێکردن و حوکمڕانی بۆ دابینکەری SaaS.","P01 · عرض شامل للجوانب التجارية والعملاء والعمليات والحوكمة لدى مزوّد SaaS.","P01 · SaaS sağlayıcısı için ticari, müşteri, operasyon ve yönetişim görünümü.")} actions={<><Badge tone="good">{c("Platform online","پلاتفۆرم کارایە","المنصة متصلة","Platform çevrimiçi")}</Badge><Button onClick={()=>onNavigate?.("customers")}>{c("Provision customer","ئامادەکردنی کڕیار","تجهيز عميل","Müşteri hazırla")}</Button></>}/>
    <div className="control-tower-strip"><div><span>{c("MASTER ARCHITECTURE","پێکهاتەی سەرەکی","البنية الرئيسية","ANA MİMARİ")}</span><strong>V6.0 · SaaS Control Plane</strong></div><div><span>{c("CONTROL PLANE","بەشی کۆنترۆڵ","لوحة التحكم","KONTROL DÜZLEMİ")}</span><strong>{c("Provider-only boundary","تەنها بۆ تیمی پلاتفۆرم","مخصص للمزوّد فقط","Yalnızca sağlayıcı")}</strong></div><div><span>{c("APPLICATION PLANE","بەشی کارکردنی کڕیار","طبقة تطبيق العميل","UYGULAMA DÜZLEMİ")}</span><strong>{c("Tenant-isolated workspaces","ژینگەی کاری جیاکراوە بۆ هەر کڕیارێک","مساحات عمل معزولة لكل عميل","Müşteri bazında izole çalışma alanları")}</strong></div><div><span>{c("DEPLOYMENT","جێگیرکردن","النشر","DAĞITIM")}</span><strong>Cloudflare Worker + D1</strong></div></div>

    <section className="dashboard-section"><div className="section-title-row"><div><span className="eyebrow">{c("GLOBAL OVERVIEW","پوختەی گشتی","نظرة عامة","GENEL BAKIŞ")}</span><h2>{c("Platform estate","دۆخی گشتی پلاتفۆرم","بيئة المنصة","Platform genel durumu")}</h2></div><Badge tone="neutral">{c("Live data","داتای ڕاستەوخۆ","بيانات حية","Canlı veri")}</Badge></div>
      <div className="stats-grid executive-stats">
        <StatCard label={c("Customers / Tenants","کڕیاران","العملاء","Müşteriler")} value={s?.tenants??"—"} meta={`${s?.active_tenants??0} ${c("active / trial","چالاک / تاقیکردنەوە","نشط / تجريبي","aktif / deneme")}`}/>
        <StatCard label={c("Institutions / Branches","دامەزراوە / لقەکان","المؤسسات / الفروع","Kurumlar / Şubeler")} value={s?.branches??"—"} meta={c("Across all tenants","لە هەموو کڕیارەکاندا","عبر جميع العملاء","Tüm müşteriler genelinde")}/>
        <StatCard label={c("Active Students","قوتابیانی چالاک","الطلاب النشطون","Aktif Öğrenciler")} value={s?.students??"—"} meta={c("Platform-wide","لە ئاستی پلاتفۆرم","على مستوى المنصة","Platform genelinde")}/>
        <StatCard label={c("Active Staff","کارمەندانی چالاک","الموظفون النشطون","Aktif Personel")} value={s?.staff??"—"} meta={c("Platform-wide","لە ئاستی پلاتفۆرم","على مستوى المنصة","Platform genelinde")}/>
        <StatCard label={c("Renewals ≤ 30 days","نوێکردنەوە ≤ ٣٠ ڕۆژ","تجديدات خلال ≤ 30 يوماً","≤ 30 gün yenilemeleri")} value={s?.renewals_due??"—"} meta={c("Action window","ماوەی کردار","نافذة الإجراء","İşlem dönemi")}/>
      </div>
    </section>

    <div className="dashboard-composite mt">
      <section className="panel executive-panel"><div className="panel-head"><div><span className="eyebrow">{c("COMMERCIAL SNAPSHOT","پوختەی بازرگانی","الملخص التجاري","TİCARİ ÖZET")}</span><h3>{c("Revenue & renewal intelligence","زانیاری داهات و نوێکردنەوە","تحليلات الإيرادات والتجديد","Gelir ve yenileme analitiği")}</h3></div><Badge tone="warn">{c("Commercial engine staged","بەشی بازرگانی لە قۆناغی جێبەجێکردندایە","المحرك التجاري قيد الاستكمال","Ticari motor aşamalı")}</Badge></div>
        <div className="metric-matrix">{["ARR","MRR","New ARR","Expansion ARR","Net Revenue Retention","Gross Revenue Retention","Outstanding Platform Invoices","Failed Payments / Dunning"].map(x=><div key={x}><span>{x}</span><strong>—</strong><small>{c("Not configured yet","هێشتا ڕێکنەخراوە","غير مهيأ بعد","Henüz yapılandırılmadı")}</small></div>)}</div>
      </section>
      <section className="panel action-center-panel"><div className="panel-head"><div><span className="eyebrow">{c("ACTION CENTER","ناوەندی کردار","مركز الإجراءات","İŞLEM MERKEZİ")}</span><h3>{c("Requires provider attention","پێویستی بە سەرنجی تیمی پلاتفۆرم هەیە","يتطلب اهتمام المزوّد","Sağlayıcı dikkati gerekiyor")}</h3></div><Badge tone="info">P01</Badge></div><div className="action-list">{actions.map(([text,count,code])=><button key={String(text)} onClick={()=>onNavigate?.(`module-${code}`)}><div><strong>{text}</strong><span>{code}</span></div><b>{count}</b><i>→</i></button>)}</div></section>
    </div>

    <div className="grid-3 mt">
      <section className="panel health-panel"><div className="panel-head"><h3>{c("Customer health","دۆخی کڕیاران","صحة العملاء","Müşteri sağlığı")}</h3><Badge tone="info">P12</Badge></div><div className="health-bars">{[[c("Healthy","باش","سليم","Sağlıklı"),0,"good"],[c("Watch","چاودێری","مراقبة","İzle"),0,"warn"],[c("At risk","لە مەترسیدا","معرض للخطر","Riskli"),0,"bad"],[c("Onboarding delayed","دەستپێکردن دواخراوە","تأخر الإعداد","Onboarding gecikmiş"),0,"warn"],[c("Renewal risk","مەترسی نوێکردنەوە","خطر التجديد","Yenileme riski"),0,"bad"]].map(([x,n,t]:any)=><div key={x}><span>{x}</span><div><i className={`health-${t}`} style={{width:`${Math.max(4,n*10)}%`}}></i></div><strong>{n}</strong></div>)}</div></section>
      <section className="panel"><div className="panel-head"><h3>{c("Operations snapshot","پوختەی کارپێکردن","ملخص العمليات","Operasyon özeti")}</h3><Badge tone="good">{c("Core online","بنەما کارایە","النواة متصلة","Çekirdek çevrimiçi")}</Badge></div><div className="status-stack"><div><span>{c("Worker availability","دۆخی Worker","توفر Worker","Worker kullanılabilirliği")}</span><strong>{c("Online","کارا","متصل","Çevrimiçi")}</strong></div><div><span>D1 database binding</span><strong>{c("Connected","پەیوەستە","متصل","Bağlı")}</strong></div><div><span>{c("Queue backlog","ڕیزی چاوەڕوانی Queue","تراكم قائمة الانتظار","Kuyruk birikimi")}</span><strong>{c("Not enabled","چالاک نەکراوە","غير مفعّل","Etkin değil")}</strong></div><div><span>{c("Backup restore test","تاقیکردنەوەی گەڕاندنەوەی پاڵپشت","اختبار استعادة النسخ الاحتياطي","Yedek geri yükleme testi")}</span><strong>{c("Not configured","ڕێکنەخراوە","غير مهيأ","Yapılandırılmadı")}</strong></div></div></section>
      <section className="panel"><div className="panel-head"><h3>{c("Control-plane coverage","داپۆشینی بەشی کۆنترۆڵ","تغطية لوحة التحكم","Kontrol düzlemi kapsamı")}</h3><Badge tone="neutral">35 modules</Badge></div><div className="coverage-ring"><div><strong>35</strong><span>{c("Provider modules registered","ماژوولی پلاتفۆرم تۆمارکراوە","وحدة مزوّد مسجلة","Sağlayıcı modülü kayıtlı")}</span></div></div><p className="muted-text">{c("P01–P35 are available from the provider navigation and each module now has a working operational workbench.","P01–P35 لە ناڤیگەیشنی پلاتفۆرم بەردەستن و ئێستا هەر ماژوولێک ژینگەی کاری کارای خۆی هەیە.","الوحدات P01–P35 متاحة من تنقل المزوّد، ولكل وحدة الآن مساحة عمل تشغيلية.","P01–P35 sağlayıcı menüsünde kullanılabilir ve her modülün çalışan bir operasyon alanı vardır.")}</p></section>
    </div>
  </div>
}
