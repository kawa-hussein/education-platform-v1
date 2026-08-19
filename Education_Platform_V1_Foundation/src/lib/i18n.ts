export type Lang = "en"|"ku"|"ar"|"tr";

const dict: Record<Lang,Record<string,string>> = {
  en: {
    dashboard:"Dashboard", customers:"Customers", branches:"Branches", students:"Students", staff:"Staff",
    attendance:"Attendance", finance:"Finance", payroll:"Payroll", import:"Import", access:"Users & Access",
    architecture:"Architecture", audit:"Audit", settings:"Settings", logout:"Log out", create:"Create",
    search:"Search", noData:"No data yet", provider:"Platform Control Center", tenant:"School Workspace",
    providerPlane:"Provider Control Plane", tenantPlane:"Tenant Application", providerOps:"Enterprise SaaS Operations",
    internalAdmin:"Internal SaaS administration", groupAllBranches:"Group / all branches", providerScope:"Provider scope / no tenant",
    searchModules:"Search modules…", architectureMap:"V6 Architecture Map", loading:"Loading Education Platform…",
    selectTenant:"Select a customer tenant", selectTenantHelp:"Choose a school group from the scope selector or provision a customer first.",
    openCustomerDirectory:"Open customer directory", commandCenter:"Command Center", commercial:"Commercial",
    deliveryCustomer:"Delivery & Customer", operationsReliability:"Operations & Reliability", platformGovernance:"Platform & Governance",
    financeIntelligence:"Finance & Intelligence", administrationProtection:"Administration & Protection",
    organizationIdentity:"Organization & Identity", configurationAutomation:"Configuration & Automation",
    documentsWorkHistory:"Documents, Work & History", governanceDataIntegration:"Governance, Data & Integration",
    enterpriseAdministration:"Enterprise Administration", academicCore:"Academic Core", studentCareSupport:"Student Care & Support",
    portalsCommunity:"Portals & School Community", financeOperations:"Finance & Operations", payrollFundingDevelopment:"Payroll, Funding & Development",
    growthQualityResilience:"Growth, Quality & Resilience", academyCore:"Academy Core", billingOperations:"Billing & Operations",
    academicLifecycle:"Academic Lifecycle", studentFinance:"Student Finance", facultyResearch:"Faculty & Research",
    campusStudentAffairs:"Campus & Student Affairs", institutionalEffectiveness:"Institutional Effectiveness",
    language:"Language", english:"English", kurdish:"Kurdish (Sorani)", arabic:"Arabic", turkish:"Turkish",
    module:"Module", page:"Page", view:"View", workspace:"Workspace", tab:"Tab", section:"Section",
    openWorkspace:"Open workspace", openLiveWorkspace:"Open live workspace", actions:"Actions", records:"Records",
    newRecord:"New record", edit:"Edit", save:"Save", cancel:"Cancel", close:"Close", delete:"Delete", status:"Status",
    owner:"Owner", title:"Title", type:"Type", notes:"Notes", details:"Details", created:"Created", updated:"Updated",
    workflow:"Workflow", approvals:"Approvals", permissions:"Permissions", dataScope:"Data scope", events:"Events",
    automations:"Automations", notifications:"Notifications", reports:"Reports", kpis:"KPIs", configuration:"Configuration",
    integrations:"Integrations", api:"API", privacy:"Privacy", retention:"Retention", validation:"Validation", businessRules:"Business rules",
    entities:"Entities", relationships:"Relationships", states:"States", auditTrail:"Audit trail", overview:"Overview",
    architectureDepth:"Architecture depth", completenessGate:"Domain completeness gate", implementationStatus:"Implementation status",
    ready:"Ready", partial:"Partial", queued:"Queued", live:"Live", staged:"Staged", foundationLive:"Foundation live",
    operationalFoundation:"Operational foundation", architectureWorkspace:"Architecture-backed workspace",
    sourceArchitecture:"Master Architecture V6.0", createRecordHelp:"Create a working record for this module. Records are tenant/branch scoped and audited.",
    recordTitle:"Record title", recordType:"Record type", recordStatus:"Record status", description:"Description",
    noRecords:"No records in this workspace yet", noRecordsHelp:"Use New record to start working in this V6 module.",
    backToModule:"Back to module", moduleWorkbench:"Operational workbench", activity:"Activity", filters:"Filters",
    allStatuses:"All statuses", draft:"Draft", active:"Active", pending:"Pending", approved:"Approved", completed:"Completed", archived:"Archived",
    firstSetup:"FIRST-TIME SETUP", secureSignIn:"SECURE SIGN IN", createFirstOwner:"Create the first Platform Owner", welcomeBack:"Welcome back",
    setupHelp:"This account controls the SaaS provider side. Customer school accounts are created separately.",
    signInHelp:"Sign in to your authorized workspace.", fullName:"Full name", email:"Email", password:"Password",
    minimum10:"Minimum 10 characters", pleaseWait:"Please wait…", initializePlatform:"Initialize platform", signIn:"Sign in",
    providerControl:"Provider Control", schoolGroups:"School Groups", operations:"Operations",
    tenantsPlansRenewals:"Tenants • Plans • Renewals", branchesManagersUsers:"Branches • Managers • Users", studentsAttendanceFinance:"Students • Attendance • Finance"
  },
  ku: {
    dashboard:"داشبۆرد", customers:"کڕیاران", branches:"لقەکان", students:"قوتابیان", staff:"کارمەندان",
    attendance:"ئامادەبوون", finance:"دارایی", payroll:"مووچە", import:"هاوردەکردن", access:"بەکارهێنەران و دەسەڵاتەکان",
    architecture:"پێکهاتەی سیستەم", audit:"تۆماری پشکنین", settings:"ڕێکخستنەکان", logout:"چوونەدەرەوە", create:"دروستکردن",
    search:"گەڕان", noData:"هێشتا هیچ داتایەک نییە", provider:"ناوەندی بەڕێوەبردنی پلاتفۆرم", tenant:"ژینگەی قوتابخانە",
    providerPlane:"بەشی بەڕێوەبردنی پلاتفۆرم", tenantPlane:"بەشی کارکردنی کڕیار", providerOps:"بەڕێوەبردنی پیشەیی SaaS",
    internalAdmin:"بەڕێوەبردنی ناوخۆیی SaaS", groupAllBranches:"گرووپ / هەموو لقەکان", providerScope:"ئاستی پلاتفۆرم / بێ کڕیار",
    searchModules:"گەڕان بەدوای ماژوولەکان…", architectureMap:"نەخشەی پێکهاتەی V6", loading:"پلاتفۆرمی پەروەردە بار دەکرێت…",
    selectTenant:"کڕیارێک هەڵبژێرە", selectTenantHelp:"لە هەڵبژێرەری ئاستەکان گرووپی قوتابخانە هەڵبژێرە، یان سەرەتا کڕیارێک دروست بکە.",
    openCustomerDirectory:"کردنەوەی بەڕێوەبردنی کڕیاران", commandCenter:"ناوەندی فەرمان", commercial:"بازرگانی",
    deliveryCustomer:"جێبەجێکردن و خزمەتگوزاری کڕیار", operationsReliability:"کارپێکردن و بەردەوامی", platformGovernance:"پلاتفۆرم و حوکمڕانی",
    financeIntelligence:"دارایی و زانیاری بەڕێوەبردن", administrationProtection:"بەڕێوەبردن و پاراستن",
    organizationIdentity:"ڕێکخراو و ناسنامە", configurationAutomation:"ڕێکخستن و خۆکارکردن",
    documentsWorkHistory:"بەڵگەنامە، کار و مێژوو", governanceDataIntegration:"حوکمڕانی، داتا و پەیوەستکردن",
    enterpriseAdministration:"بەڕێوەبردنی دامەزراوەیی", academicCore:"بنەمای ئەکادیمی", studentCareSupport:"چاودێری و پشتگیری قوتابی",
    portalsCommunity:"پۆرتاڵەکان و کۆمەڵگەی قوتابخانە", financeOperations:"دارایی و کارپێکردن", payrollFundingDevelopment:"مووچە، دارایی پشتگیری و گەشەپێدان",
    growthQualityResilience:"گەشە، کوالێتی و خۆڕاگری", academyCore:"بنەمای ئەکادیمی", billingOperations:"پسولە و کارپێکردن",
    academicLifecycle:"خولی ژیانی ئەکادیمی", studentFinance:"دارایی قوتابی", facultyResearch:"مامۆستا و توێژینەوە",
    campusStudentAffairs:"کامپەس و کاروباری قوتابیان", institutionalEffectiveness:"کارایی دامەزراوە",
    language:"زمان", english:"ئینگلیزی", kurdish:"کوردی (سۆرانی)", arabic:"عەرەبی", turkish:"تورکی",
    module:"ماژوول", page:"پەڕە", view:"دیمەن", workspace:"ژینگەی کار", tab:"تاب", section:"بەش",
    openWorkspace:"کردنەوەی ژینگەی کار", openLiveWorkspace:"کردنەوەی ژینگەی کارکردن", actions:"کردارەکان", records:"تۆمارەکان",
    newRecord:"تۆماری نوێ", edit:"دەستکاری", save:"پاشەکەوتکردن", cancel:"هەڵوەشاندنەوە", close:"داخستن", delete:"سڕینەوە", status:"دۆخ",
    owner:"بەرپرسیار", title:"ناونیشان", type:"جۆر", notes:"تێبینییەکان", details:"وردەکاری", created:"دروستکراو", updated:"نوێکراوەتەوە",
    workflow:"ڕەوتی کار", approvals:"پەسەندکردنەکان", permissions:"دەسەڵاتەکان", dataScope:"ئاستی دەستگەیشتن بە داتا", events:"ڕووداوەکان",
    automations:"خۆکارکردنەکان", notifications:"ئاگادارکردنەوەکان", reports:"ڕاپۆرتەکان", kpis:"پێوەرە سەرەکییەکان", configuration:"ڕێکخستن",
    integrations:"پەیوەستکردنەکان", api:"API", privacy:"تایبەتمەندی", retention:"ماوەی هەڵگرتن", validation:"پشتڕاستکردنەوە", businessRules:"یاساکانی کار",
    entities:"یەکە داتاییەکان", relationships:"پەیوەندییەکان", states:"دۆخەکان", auditTrail:"مێژووی پشکنین", overview:"پوختە",
    architectureDepth:"قووڵایی پێکهاتە", completenessGate:"پشکنینی تەواوبوونی بوار", implementationStatus:"دۆخی جێبەجێکردن",
    ready:"ئامادە", partial:"بەشێک جێبەجێکراو", queued:"لە ڕیزدایە", live:"کارا", staged:"ئامادەکراو", foundationLive:"بنەما کارایە",
    operationalFoundation:"بنەمای کارپێکردن", architectureWorkspace:"ژینگەی کار لەسەر بنەمای پێکهاتە",
    sourceArchitecture:"Master Architecture V6.0", createRecordHelp:"تۆمارێکی کارا بۆ ئەم ماژوولە دروست بکە. تۆمارەکان بە ئاستی کڕیار و لق سنووردارن و هەموو گۆڕانکارییەکان تۆمار دەکرێن.",
    recordTitle:"ناونیشانی تۆمار", recordType:"جۆری تۆمار", recordStatus:"دۆخی تۆمار", description:"وەسف",
    noRecords:"هێشتا هیچ تۆمارێک لەم ژینگەی کارەدا نییە", noRecordsHelp:"بۆ دەستپێکردنی کار لەم ماژوولی V6 ـە، «تۆماری نوێ» هەڵبژێرە.",
    backToModule:"گەڕانەوە بۆ ماژوول", moduleWorkbench:"ژینگەی کارپێکردنی ماژوول", activity:"چالاکی", filters:"پاڵاوتن",
    allStatuses:"هەموو دۆخەکان", draft:"ڕەشنووس", active:"چالاک", pending:"چاوەڕوان", approved:"پەسەندکراو", completed:"تەواوکراو", archived:"ئەرشیفکراو",
    firstSetup:"دامەزراندنی یەکەمجار", secureSignIn:"چوونەژوورەوەی پارێزراو", createFirstOwner:"دروستکردنی یەکەم بەڕێوەبەری پلاتفۆرم", welcomeBack:"بەخێربێیتەوە",
    setupHelp:"ئەم هەژمارە بەشی دابینکەری SaaS بەڕێوە دەبات. هەژماری کڕیار و قوتابخانەکان بە جیا دروست دەکرێن.",
    signInHelp:"بە هەژماری ڕێگەپێدراوی خۆت بچۆ ژوورەوە.", fullName:"ناوی تەواو", email:"ئیمەیڵ", password:"وشەی نهێنی",
    minimum10:"لانیکەم ١٠ پیت", pleaseWait:"تکایە چاوەڕێ بکە…", initializePlatform:"دەستپێکردنی پلاتفۆرم", signIn:"چوونەژوورەوە",
    providerControl:"بەڕێوەبردنی پلاتفۆرم", schoolGroups:"گرووپی قوتابخانەکان", operations:"کارپێکردن",
    tenantsPlansRenewals:"کڕیاران • پلانەکان • نوێکردنەوە", branchesManagersUsers:"لقەکان • بەڕێوەبەران • بەکارهێنەران", studentsAttendanceFinance:"قوتابیان • ئامادەبوون • دارایی"
  },
  ar: {
    dashboard:"لوحة التحكم", customers:"العملاء", branches:"الفروع", students:"الطلاب", staff:"الموظفون",
    attendance:"الحضور", finance:"المالية", payroll:"الرواتب", import:"الاستيراد", access:"المستخدمون والصلاحيات",
    architecture:"بنية النظام", audit:"سجل التدقيق", settings:"الإعدادات", logout:"تسجيل الخروج", create:"إنشاء",
    search:"بحث", noData:"لا توجد بيانات بعد", provider:"مركز إدارة المنصة", tenant:"مساحة المدرسة",
    providerPlane:"لوحة تحكم المزوّد", tenantPlane:"تطبيق العميل", providerOps:"عمليات SaaS المؤسسية", internalAdmin:"إدارة SaaS الداخلية",
    groupAllBranches:"المجموعة / جميع الفروع", providerScope:"نطاق المزوّد / بلا عميل", searchModules:"البحث في الوحدات…", architectureMap:"خريطة بنية V6",
    loading:"جارٍ تحميل منصة التعليم…", selectTenant:"اختر عميلاً", selectTenantHelp:"اختر مجموعة مدارس من محدد النطاق أو أنشئ عميلاً أولاً.",
    openCustomerDirectory:"فتح دليل العملاء", commandCenter:"مركز القيادة", commercial:"التجاري", deliveryCustomer:"التسليم والعملاء",
    operationsReliability:"العمليات والموثوقية", platformGovernance:"المنصة والحوكمة", financeIntelligence:"المالية والتحليلات", administrationProtection:"الإدارة والحماية",
    organizationIdentity:"المؤسسة والهوية", configurationAutomation:"الإعداد والأتمتة", documentsWorkHistory:"الوثائق والعمل والسجل",
    governanceDataIntegration:"الحوكمة والبيانات والتكامل", enterpriseAdministration:"الإدارة المؤسسية", academicCore:"الأساس الأكاديمي",
    studentCareSupport:"رعاية ودعم الطلاب", portalsCommunity:"البوابات ومجتمع المدرسة", financeOperations:"المالية والعمليات",
    payrollFundingDevelopment:"الرواتب والتمويل والتطوير", growthQualityResilience:"النمو والجودة والمرونة", academyCore:"أساس الأكاديمية",
    billingOperations:"الفوترة والعمليات", academicLifecycle:"الدورة الأكاديمية", studentFinance:"مالية الطالب", facultyResearch:"هيئة التدريس والبحث",
    campusStudentAffairs:"الحرم وشؤون الطلاب", institutionalEffectiveness:"الفاعلية المؤسسية", language:"اللغة", english:"الإنجليزية", kurdish:"الكردية (السورانية)", arabic:"العربية", turkish:"التركية",
    module:"وحدة", page:"صفحة", view:"عرض", workspace:"مساحة عمل", tab:"تبويب", section:"قسم", openWorkspace:"فتح مساحة العمل", openLiveWorkspace:"فتح مساحة العمل الفعلية",
    actions:"الإجراءات", records:"السجلات", newRecord:"سجل جديد", edit:"تعديل", save:"حفظ", cancel:"إلغاء", close:"إغلاق", delete:"حذف", status:"الحالة",
    owner:"المسؤول", title:"العنوان", type:"النوع", notes:"ملاحظات", details:"التفاصيل", created:"تاريخ الإنشاء", updated:"آخر تحديث",
    workflow:"سير العمل", approvals:"الموافقات", permissions:"الصلاحيات", dataScope:"نطاق البيانات", events:"الأحداث", automations:"الأتمتة", notifications:"الإشعارات",
    reports:"التقارير", kpis:"مؤشرات الأداء", configuration:"الإعداد", integrations:"التكاملات", api:"API", privacy:"الخصوصية", retention:"الاحتفاظ",
    validation:"التحقق", businessRules:"قواعد العمل", entities:"الكيانات", relationships:"العلاقات", states:"الحالات", auditTrail:"مسار التدقيق", overview:"نظرة عامة",
    architectureDepth:"عمق البنية", completenessGate:"بوابة اكتمال المجال", implementationStatus:"حالة التنفيذ", ready:"جاهز", partial:"جزئي", queued:"في قائمة التنفيذ", live:"فعال", staged:"مرحلي",
    foundationLive:"الأساس فعال", operationalFoundation:"أساس تشغيلي", architectureWorkspace:"مساحة عمل مبنية على البنية", sourceArchitecture:"Master Architecture V6.0",
    createRecordHelp:"أنشئ سجلاً عملياً لهذه الوحدة. السجلات مقيدة بنطاق العميل والفرع وتخضع للتدقيق.", recordTitle:"عنوان السجل", recordType:"نوع السجل", recordStatus:"حالة السجل", description:"الوصف",
    noRecords:"لا توجد سجلات في مساحة العمل بعد", noRecordsHelp:"استخدم «سجل جديد» لبدء العمل في وحدة V6 هذه.", backToModule:"العودة إلى الوحدة", moduleWorkbench:"مساحة التشغيل", activity:"النشاط", filters:"الفلاتر",
    allStatuses:"كل الحالات", draft:"مسودة", active:"فعال", pending:"قيد الانتظار", approved:"معتمد", completed:"مكتمل", archived:"مؤرشف",
    firstSetup:"الإعداد لأول مرة", secureSignIn:"تسجيل دخول آمن", createFirstOwner:"إنشاء أول مالك للمنصة", welcomeBack:"مرحباً بعودتك",
    setupHelp:"يتحكم هذا الحساب في جانب مزوّد SaaS. يتم إنشاء حسابات المدارس العملاء بشكل منفصل.", signInHelp:"سجّل الدخول إلى مساحة العمل المصرّح بها.", fullName:"الاسم الكامل", email:"البريد الإلكتروني", password:"كلمة المرور",
    minimum10:"10 أحرف على الأقل", pleaseWait:"يرجى الانتظار…", initializePlatform:"تهيئة المنصة", signIn:"تسجيل الدخول",
    providerControl:"تحكم المزوّد", schoolGroups:"مجموعات المدارس", operations:"العمليات", tenantsPlansRenewals:"العملاء • الخطط • التجديدات", branchesManagersUsers:"الفروع • المديرون • المستخدمون", studentsAttendanceFinance:"الطلاب • الحضور • المالية"
  },
  tr: {
    dashboard:"Gösterge Paneli", customers:"Müşteriler", branches:"Şubeler", students:"Öğrenciler", staff:"Personel",
    attendance:"Devam", finance:"Finans", payroll:"Bordro", import:"İçe Aktarma", access:"Kullanıcılar ve Yetkiler",
    architecture:"Sistem Mimarisi", audit:"Denetim Kaydı", settings:"Ayarlar", logout:"Çıkış", create:"Oluştur",
    search:"Ara", noData:"Henüz veri yok", provider:"Platform Yönetim Merkezi", tenant:"Okul Çalışma Alanı",
    providerPlane:"Sağlayıcı Kontrol Düzlemi", tenantPlane:"Müşteri Uygulaması", providerOps:"Kurumsal SaaS Operasyonları", internalAdmin:"Dahili SaaS yönetimi",
    groupAllBranches:"Grup / tüm şubeler", providerScope:"Sağlayıcı kapsamı / müşteri yok", searchModules:"Modüllerde ara…", architectureMap:"V6 Mimari Haritası",
    loading:"Eğitim Platformu yükleniyor…", selectTenant:"Bir müşteri seçin", selectTenantHelp:"Kapsam seçicisinden bir okul grubu seçin veya önce bir müşteri oluşturun.",
    openCustomerDirectory:"Müşteri dizinini aç", commandCenter:"Komuta Merkezi", commercial:"Ticari", deliveryCustomer:"Teslimat ve Müşteri",
    operationsReliability:"Operasyon ve Güvenilirlik", platformGovernance:"Platform ve Yönetişim", financeIntelligence:"Finans ve Analitik", administrationProtection:"Yönetim ve Koruma",
    organizationIdentity:"Organizasyon ve Kimlik", configurationAutomation:"Yapılandırma ve Otomasyon", documentsWorkHistory:"Belgeler, İş ve Geçmiş",
    governanceDataIntegration:"Yönetişim, Veri ve Entegrasyon", enterpriseAdministration:"Kurumsal Yönetim", academicCore:"Akademik Çekirdek",
    studentCareSupport:"Öğrenci Bakım ve Desteği", portalsCommunity:"Portallar ve Okul Topluluğu", financeOperations:"Finans ve Operasyon",
    payrollFundingDevelopment:"Bordro, Finansman ve Gelişim", growthQualityResilience:"Büyüme, Kalite ve Dayanıklılık", academyCore:"Akademi Çekirdeği",
    billingOperations:"Faturalama ve Operasyon", academicLifecycle:"Akademik Yaşam Döngüsü", studentFinance:"Öğrenci Finansı", facultyResearch:"Akademik Kadro ve Araştırma",
    campusStudentAffairs:"Kampüs ve Öğrenci İşleri", institutionalEffectiveness:"Kurumsal Etkinlik", language:"Dil", english:"İngilizce", kurdish:"Kürtçe (Sorani)", arabic:"Arapça", turkish:"Türkçe",
    module:"Modül", page:"Sayfa", view:"Görünüm", workspace:"Çalışma Alanı", tab:"Sekme", section:"Bölüm", openWorkspace:"Çalışma alanını aç", openLiveWorkspace:"Canlı çalışma alanını aç",
    actions:"İşlemler", records:"Kayıtlar", newRecord:"Yeni kayıt", edit:"Düzenle", save:"Kaydet", cancel:"İptal", close:"Kapat", delete:"Sil", status:"Durum",
    owner:"Sorumlu", title:"Başlık", type:"Tür", notes:"Notlar", details:"Ayrıntılar", created:"Oluşturuldu", updated:"Güncellendi",
    workflow:"İş Akışı", approvals:"Onaylar", permissions:"Yetkiler", dataScope:"Veri Kapsamı", events:"Olaylar", automations:"Otomasyonlar", notifications:"Bildirimler",
    reports:"Raporlar", kpis:"KPI'lar", configuration:"Yapılandırma", integrations:"Entegrasyonlar", api:"API", privacy:"Gizlilik", retention:"Saklama",
    validation:"Doğrulama", businessRules:"İş Kuralları", entities:"Varlıklar", relationships:"İlişkiler", states:"Durumlar", auditTrail:"Denetim İzi", overview:"Genel Bakış",
    architectureDepth:"Mimari Derinlik", completenessGate:"Alan Tamlık Kontrolü", implementationStatus:"Uygulama Durumu", ready:"Hazır", partial:"Kısmi", queued:"Sırada", live:"Canlı", staged:"Aşamalı",
    foundationLive:"Temel canlı", operationalFoundation:"Operasyonel temel", architectureWorkspace:"Mimari destekli çalışma alanı", sourceArchitecture:"Master Architecture V6.0",
    createRecordHelp:"Bu modül için çalışan bir kayıt oluşturun. Kayıtlar müşteri/şube kapsamındadır ve denetlenir.", recordTitle:"Kayıt başlığı", recordType:"Kayıt türü", recordStatus:"Kayıt durumu", description:"Açıklama",
    noRecords:"Bu çalışma alanında henüz kayıt yok", noRecordsHelp:"Bu V6 modülünde çalışmaya başlamak için Yeni kayıt seçeneğini kullanın.", backToModule:"Modüle dön", moduleWorkbench:"Operasyon çalışma alanı", activity:"Aktivite", filters:"Filtreler",
    allStatuses:"Tüm durumlar", draft:"Taslak", active:"Aktif", pending:"Bekliyor", approved:"Onaylandı", completed:"Tamamlandı", archived:"Arşivlendi",
    firstSetup:"İLK KURULUM", secureSignIn:"GÜVENLİ GİRİŞ", createFirstOwner:"İlk Platform Sahibını oluştur", welcomeBack:"Tekrar hoş geldiniz",
    setupHelp:"Bu hesap SaaS sağlayıcı tarafını yönetir. Müşteri okul hesapları ayrı oluşturulur.", signInHelp:"Yetkili çalışma alanınıza giriş yapın.", fullName:"Ad Soyad", email:"E-posta", password:"Parola",
    minimum10:"En az 10 karakter", pleaseWait:"Lütfen bekleyin…", initializePlatform:"Platformu başlat", signIn:"Giriş yap",
    providerControl:"Sağlayıcı Kontrolü", schoolGroups:"Okul Grupları", operations:"Operasyonlar", tenantsPlansRenewals:"Müşteriler • Planlar • Yenilemeler", branchesManagersUsers:"Şubeler • Yöneticiler • Kullanıcılar", studentsAttendanceFinance:"Öğrenciler • Devam • Finans"
  }
};

export const tr=(lang:Lang,key:string)=>dict[lang]?.[key]||dict.en[key]||key;

const exactLabels:Record<Exclude<Lang,"en">,Record<string,string>>={
  ku:{
    "Global Overview":"پوختەی گشتی","Commercial Snapshot":"پوختەی بازرگانی","Customer Health Snapshot":"پوختەی دۆخی کڕیار","Operations Snapshot":"پوختەی کارپێکردن","Action Center":"ناوەندی کردار","Executive Drill-Down":"وردبینی بەڕێوەبەری",
    "Customer Directory":"بەڕێوەبردنی کڕیاران","Customer / Tenant Workspace":"ژینگەی کاری کڕیار","Organization Hierarchy":"پلەبەندی ڕێکخراو","Group Workspace":"ژینگەی کاری گرووپ","Institution / School Workspace":"ژینگەی کاری دامەزراوە / قوتابخانە","Branch / Campus Workspace":"ژینگەی کاری لق / کامپەس",
    "Academic Setup":"ڕێکخستنی ئەکادیمی","Admissions":"وەرگرتن","Applicant":"داواکار","Enrollment":"تۆمارکردن","Students":"قوتابیان","Student Workspace":"ژینگەی کاری قوتابی","Curriculum":"پرۆگرامی خوێندن","Course Workspace":"ژینگەی کاری کۆرس","Scheduling":"خشتەبەندی","Timetable Builder Flow":"ڕەوتی دروستکردنی خشتەی وانە",
    "Calendar":"ڕۆژژمێر","Teaching":"وانەوتنەوە","Class":"پۆل","Attendance":"ئامادەبوون","Register Workspace":"ژینگەی تۆماری ئامادەبوون","Assessment":"هەڵسەنگاندن","Gradebook":"تۆماری نمرە","Gradebook Workspace":"ژینگەی تۆماری نمرە","Exams":"تاقیکردنەوەکان","Reporting":"ڕاپۆرتکردن",
    "Behaviour":"هەڵسوکەوت","Safeguarding":"پاراستنی قوتابی","Safeguarding Case":"کەیسی پاراستنی قوتابی","Wellbeing":"خۆشگوزەرانی و دۆخی دەروونی","Learning Support":"پشتگیری فێربوون","Medical":"تەندروستی","Parent":"دایک و باوک","Student":"قوتابی","Teacher":"مامۆستا","Parent Meetings":"کۆبوونەوەی دایک و باوک","Activities":"چالاکییەکان","Trips":"گەشتە خوێندنییەکان","Transport":"گواستنەوە","Dismissal":"دەرچوونی قوتابی","Meals":"خواردن","Library":"کتێبخانە",
    "Student & Family Billing":"پسولەی قوتابی و خێزان","Accounting":"ژمێریاری","Procurement & Supplier Management":"کڕین و بەڕێوەبردنی دابینکەران","Assets":"سامانەکان","Facilities":"بیناکان و خزمەتگوزارییەکان","HR / Workforce":"سەرچاوە مرۆییەکان","Cover":"جێگرەوەی مامۆستا","Reception":"پێشوازی","Visitors":"سەردانکەران","Safety & Emergency":"سەلامەتی و دۆخی فریاکەوتن","Payroll & Compensation":"مووچە و پاداشت","Financial Aid":"یارمەتی دارایی","Expense Management":"بەڕێوەبردنی خەرجی","Funds & Grants":"سندوق و گرەنت","Multi-Entity Finance":"دارایی چەند یەکەیی","Cashier / POS":"کاشێر / خاڵی فرۆشتن","Marketing CRM":"CRMی بازاڕگەری","Public Website / CMS":"وێبسایتی گشتی / CMS","Quality & Accreditation":"کوالێتی و پەسەندنامە","Complaints & Appeals":"سکاڵا و تانە","IT Operations":"کارپێکردنی IT","Physical Access":"دەستگەیشتنی فیزیکی","Year-End / Rollover":"کۆتایی ساڵ / گواستنەوە","Regulatory Reporting":"ڕاپۆرتی یاسایی","Business Continuity":"بەردەوامی کاروبار",
    "Provider Owner":"خاوەنی پلاتفۆرم","Platform Super Admin":"سەرپەرشتیاری باڵای پلاتفۆرم","SaaS Operations Admin":"بەڕێوەبەری کارپێکردنی SaaS","Security Admin":"بەڕێوەبەری ئاسایش","Support Engineer":"ئەندازیاری پشتگیری","Support Manager":"بەڕێوەبەری پشتگیری","Implementation Consultant":"ڕاوێژکاری جێبەجێکردن","Customer Success Manager":"بەڕێوەبەری سەرکەوتنی کڕیار","Account Manager":"بەڕێوەبەری هەژمار","Sales User":"بەکارهێنەری فرۆشتن","Billing / Revenue Ops":"پسولە و بەڕێوەبردنی داهات","Product Manager":"بەڕێوەبەری بەرهەم","Release Manager":"بەڕێوەبەری بڵاوکردنەوە","Auditor":"پشکنەر","Read-Only Executive":"بەڕێوەبەری تەنها-خوێندنەوە",
    "Security":"ئاسایش","Roles":"ڕۆڵەکان","Permissions":"دەسەڵاتەکان","Notifications":"ئاگادارکردنەوەکان","Documents":"بەڵگەنامەکان","Forms":"فۆرمەکان","Consents":"ڕەزامەندییەکان","Audit":"پشکنین","Governance":"حوکمڕانی","Data Quality":"کوالێتی داتا","Data Management":"بەڕێوەبردنی داتا","Integrations":"پەیوەستکردنەکان","Search":"گەڕان","Analytics":"شیکاری","System":"سیستەم","Backup":"پاڵپشت","Contracts":"گرێبەستەکان","Service Desk":"ناوەندی خزمەتگوزاری","Localization":"خۆجێییکردن","Records Management":"بەڕێوەبردنی تۆمارەکان"
  },
  ar:{
    "Global Overview":"نظرة عامة شاملة","Commercial Snapshot":"ملخص تجاري","Customer Health Snapshot":"ملخص صحة العميل","Operations Snapshot":"ملخص العمليات","Action Center":"مركز الإجراءات","Executive Drill-Down":"تحليل تنفيذي متعمق",
    "Customer Directory":"دليل العملاء","Customer / Tenant Workspace":"مساحة عمل العميل","Academic Setup":"الإعداد الأكاديمي","Admissions":"القبول","Applicant":"المتقدم","Enrollment":"التسجيل","Students":"الطلاب","Student Workspace":"مساحة عمل الطالب","Curriculum":"المناهج","Scheduling":"الجدولة","Calendar":"التقويم","Teaching":"التدريس","Class":"الصف","Attendance":"الحضور","Assessment":"التقييم","Gradebook":"سجل الدرجات","Exams":"الاختبارات","Reporting":"التقارير","Behaviour":"السلوك","Safeguarding":"حماية الطالب","Wellbeing":"الرفاه","Learning Support":"دعم التعلم","Medical":"الصحة","Parent":"ولي الأمر","Teacher":"المعلم","Transport":"النقل","Library":"المكتبة","Accounting":"المحاسبة","Facilities":"المرافق","Security":"الأمن","Permissions":"الصلاحيات","Notifications":"الإشعارات","Documents":"الوثائق","Audit":"التدقيق","Analytics":"التحليلات"
  },
  tr:{
    "Global Overview":"Genel Bakış","Commercial Snapshot":"Ticari Özet","Customer Health Snapshot":"Müşteri Sağlık Özeti","Operations Snapshot":"Operasyon Özeti","Action Center":"İşlem Merkezi","Executive Drill-Down":"Yönetici Detay Analizi",
    "Customer Directory":"Müşteri Dizini","Customer / Tenant Workspace":"Müşteri Çalışma Alanı","Organization Hierarchy":"Organizasyon Hiyerarşisi","Academic Setup":"Akademik Kurulum","Admissions":"Kabul","Applicant":"Aday","Enrollment":"Kayıt","Students":"Öğrenciler","Student Workspace":"Öğrenci Çalışma Alanı","Curriculum":"Müfredat","Scheduling":"Planlama","Calendar":"Takvim","Teaching":"Öğretim","Class":"Sınıf","Attendance":"Devam","Assessment":"Değerlendirme","Gradebook":"Not Defteri","Exams":"Sınavlar","Reporting":"Raporlama","Behaviour":"Davranış","Safeguarding":"Öğrenci Koruma","Wellbeing":"İyi Oluş","Learning Support":"Öğrenme Desteği","Medical":"Sağlık","Parent":"Veli","Teacher":"Öğretmen","Transport":"Ulaşım","Library":"Kütüphane","Accounting":"Muhasebe","Facilities":"Tesisler","Security":"Güvenlik","Permissions":"Yetkiler","Notifications":"Bildirimler","Documents":"Belgeler","Audit":"Denetim","Analytics":"Analitik"
  }
};

const phraseParts:Record<Exclude<Lang,"en">,Record<string,string>>={
  ku:{
    "Overview":"پوختە","Dashboard":"داشبۆرد","Workspace":"ژینگەی کار","Management":"بەڕێوەبردن","Directory":"بەڕێوەبردن","Configuration":"ڕێکخستن","Approval":"پەسەندکردن","Approvals":"پەسەندکردنەکان","Workflow":"ڕەوتی کار","Workflows":"ڕەوتەکانی کار","History":"مێژوو","Review":"پێداچوونەوە","Audit":"پشکنین","Analytics":"شیکاری","Reports":"ڕاپۆرتەکان","Reporting":"ڕاپۆرتکردن","Settings":"ڕێکخستنەکان","Users":"بەکارهێنەران","User":"بەکارهێنەر","Roles":"ڕۆڵەکان","Role":"ڕۆڵ","Permissions":"دەسەڵاتەکان","Access":"دەستگەیشتن","Security":"ئاسایش","Privacy":"تایبەتمەندی","Compliance":"پابەندبوون","Documents":"بەڵگەنامەکان","Document":"بەڵگەنامە","Billing":"پسولە","Payments":"پارەدان","Payment":"پارەدان","Invoices":"پسولەکان","Invoice":"پسولە","Students":"قوتابیان","Student":"قوتابی","Staff":"کارمەندان","Teacher":"مامۆستا","Teachers":"مامۆستایان","Parent":"دایک و باوک","Parents":"دایک و باوک","Customer":"کڕیار","Customers":"کڕیاران","Tenant":"کڕیار","Branch":"لق","Branches":"لقەکان","Campus":"کامپەس","School":"قوتابخانە","Group":"گرووپ","Academic":"ئەکادیمی","Course":"کۆرس","Courses":"کۆرسەکان","Class":"پۆل","Classes":"پۆلەکان","Attendance":"ئامادەبوون","Assessment":"هەڵسەنگاندن","Exams":"تاقیکردنەوەکان","Finance":"دارایی","Financial":"دارایی","Accounting":"ژمێریاری","Payroll":"مووچە","Compensation":"پاداشت","Medical":"تەندروستی","Health":"تەندروستی","Support":"پشتگیری","Learning":"فێربوون","Activities":"چالاکییەکان","Transport":"گواستنەوە","Communication":"پەیوەندی","Communications":"پەیوەندییەکان","Notification":"ئاگادارکردنەوە","Notifications":"ئاگادارکردنەوەکان","Data":"داتا","Import":"هاوردەکردن","Export":"هەناردەکردن","Migration":"گواستنەوەی داتا","Integration":"پەیوەستکردن","Integrations":"پەیوەستکردنەکان","API":"API","Search":"گەڕان","Quality":"کوالێتی","Risk":"مەترسی","Incident":"ڕووداوی نائاسایی","Incidents":"ڕووداوە نائاساییەکان","Emergency":"فریاکەوتن","Safety":"سەلامەتی","Contracts":"گرێبەستەکان","Contract":"گرێبەست","Pricing":"نرخدانان","Plans":"پلانەکان","Plan":"پلان","Subscription":"بەشداری","Subscriptions":"بەشدارییەکان","Renewal":"نوێکردنەوە","Usage":"بەکارهێنان","Quota":"سنووری بەکارهێنان","Quotas":"سنوورەکان","Provider":"دابینکەر","Platform":"پلاتفۆرم","Operations":"کارپێکردن","Service":"خزمەتگوزاری","Services":"خزمەتگوزارییەکان","Records":"تۆمارەکان","Record":"تۆمار","Forms":"فۆرمەکان","Consents":"ڕەزامەندییەکان","Tasks":"ئەرکەکان","Cases":"کەیسەکان","Rules":"یاساکان","Automation":"خۆکارکردن","Events":"ڕووداوەکان","Event":"ڕووداو","Settings":"ڕێکخستنەکان"
  },
  ar:{"Overview":"نظرة عامة","Dashboard":"لوحة التحكم","Workspace":"مساحة عمل","Management":"إدارة","Configuration":"إعداد","Approval":"موافقة","Workflow":"سير العمل","History":"السجل","Review":"مراجعة","Audit":"تدقيق","Analytics":"تحليلات","Reports":"تقارير","Users":"مستخدمون","Roles":"أدوار","Permissions":"صلاحيات","Access":"وصول","Security":"أمن","Privacy":"خصوصية","Documents":"وثائق","Billing":"فوترة","Payments":"مدفوعات","Students":"طلاب","Student":"طالب","Staff":"موظفون","Teacher":"معلم","Parent":"ولي الأمر","Customer":"عميل","Tenant":"عميل","Branch":"فرع","School":"مدرسة","Academic":"أكاديمي","Course":"مقرر","Attendance":"حضور","Assessment":"تقييم","Finance":"مالية","Accounting":"محاسبة","Payroll":"رواتب","Support":"دعم","Communication":"اتصال","Data":"بيانات","Import":"استيراد","Export":"تصدير","Integration":"تكامل","Search":"بحث","Quality":"جودة","Risk":"مخاطر","Incident":"حادث","Contracts":"عقود","Pricing":"تسعير","Plans":"خطط","Subscription":"اشتراك","Renewal":"تجديد","Usage":"استخدام","Platform":"منصة","Operations":"عمليات","Records":"سجلات","Forms":"نماذج","Rules":"قواعد","Automation":"أتمتة","Events":"أحداث"},
  tr:{"Overview":"Genel Bakış","Dashboard":"Gösterge Paneli","Workspace":"Çalışma Alanı","Management":"Yönetim","Configuration":"Yapılandırma","Approval":"Onay","Workflow":"İş Akışı","History":"Geçmiş","Review":"İnceleme","Audit":"Denetim","Analytics":"Analitik","Reports":"Raporlar","Users":"Kullanıcılar","Roles":"Roller","Permissions":"Yetkiler","Access":"Erişim","Security":"Güvenlik","Privacy":"Gizlilik","Documents":"Belgeler","Billing":"Faturalama","Payments":"Ödemeler","Students":"Öğrenciler","Student":"Öğrenci","Staff":"Personel","Teacher":"Öğretmen","Parent":"Veli","Customer":"Müşteri","Tenant":"Müşteri","Branch":"Şube","School":"Okul","Academic":"Akademik","Course":"Ders","Attendance":"Devam","Assessment":"Değerlendirme","Finance":"Finans","Accounting":"Muhasebe","Payroll":"Bordro","Support":"Destek","Communication":"İletişim","Data":"Veri","Import":"İçe Aktarma","Export":"Dışa Aktarma","Integration":"Entegrasyon","Search":"Arama","Quality":"Kalite","Risk":"Risk","Incident":"Olay","Contracts":"Sözleşmeler","Pricing":"Fiyatlandırma","Plans":"Planlar","Subscription":"Abonelik","Renewal":"Yenileme","Usage":"Kullanım","Platform":"Platform","Operations":"Operasyonlar","Records":"Kayıtlar","Forms":"Formlar","Rules":"Kurallar","Automation":"Otomasyon","Events":"Olaylar"}
};

export function localizeLabel(lang:Lang,text:string):string{
  if(lang==="en"||!text)return text;
  const exact=exactLabels[lang]?.[text];
  if(exact)return exact;
  const pieces=text.split(/(\s+\/\s+|\s+&\s+|\s+—\s+)/);
  const map=phraseParts[lang]||{};
  return pieces.map(piece=>{
    if(/^\s+(\/|&|—)\s+$/.test(piece))return piece;
    const trimmed=piece.trim();
    if(exactLabels[lang]?.[trimmed])return piece.replace(trimmed,exactLabels[lang][trimmed]);
    let out=trimmed;
    Object.entries(map).sort((a,b)=>b[0].length-a[0].length).forEach(([from,to])=>{
      out=out.replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\b`,"gi"),to);
    });
    return piece.replace(trimmed,out);
  }).join("");
}
