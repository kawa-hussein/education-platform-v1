export type Lang = "en"|"ku"|"ar";
const dict: Record<Lang,Record<string,string>> = {
  en: {
    dashboard:"Dashboard", customers:"Customers", branches:"Branches", students:"Students", staff:"Staff",
    attendance:"Attendance", finance:"Finance", payroll:"Payroll", import:"Import", access:"Users & Access",
    architecture:"Architecture", audit:"Audit", settings:"Settings", logout:"Log out", create:"Create",
    search:"Search", noData:"No data yet", provider:"Platform Control Center", tenant:"School Workspace"
  },
  ku: {
    dashboard:"داشبۆرد", customers:"کڕیارەکان", branches:"لقەکان", students:"خوێندکاران", staff:"کارمەندان",
    attendance:"ئامادەبوون", finance:"دارایی", payroll:"مووچە", import:"هاوردەکردن", access:"بەکارهێنەر و دەسەڵات",
    architecture:"پێکهاتە", audit:"پشکنین", settings:"ڕێکخستن", logout:"دەرچوون", create:"دروستکردن",
    search:"گەڕان", noData:"هێشتا داتا نییە", provider:"کۆنترۆڵی پلاتفۆرم", tenant:"ژینگەی قوتابخانە"
  },
  ar: {
    dashboard:"لوحة التحكم", customers:"العملاء", branches:"الفروع", students:"الطلاب", staff:"الموظفون",
    attendance:"الحضور", finance:"المالية", payroll:"الرواتب", import:"الاستيراد", access:"المستخدمون والصلاحيات",
    architecture:"الهيكل", audit:"سجل التدقيق", settings:"الإعدادات", logout:"تسجيل الخروج", create:"إنشاء",
    search:"بحث", noData:"لا توجد بيانات بعد", provider:"مركز تحكم المنصة", tenant:"مساحة المدرسة"
  }
};
export const tr=(lang:Lang,key:string)=>dict[lang]?.[key]||dict.en[key]||key;
