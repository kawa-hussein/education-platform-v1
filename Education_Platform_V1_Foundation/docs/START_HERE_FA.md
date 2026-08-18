# از اینجا شروع کن — Education Platform V1 Foundation

این ZIP اولین نسخه اجراییِ واقعی پروژه است و از روی Master Architecture V6 ساخته شده است.

## داخل این نسخه چه چیزی واقعاً کار می‌کند؟

- ایجاد اولین **Platform Owner** با رمز هش‌شده
- Login / Logout و Session امن با HttpOnly Cookie
- Provider / SaaS Control Center
- ایجاد Customer / Tenant
- Plan / Trial / Expiration پایه
- ساخت چند Branch / Campus برای هر مشتری
- Tenant و Branch Scope
- ایجاد User با Role و Scope
- جلوگیری پایه از دادن Role بالاتر از سطح Delegation
- Student Records
- Staff / Teacher Records و Branch Assignment
- Daily Attendance
- Student Invoices
- Payroll Entries شامل Base + Variable / Percentage / Class Pay + Bonus + Allowance - Deduction
- Excel / CSV Student Import
- Audit Trail
- English / Kurdish / Arabic UI switch
- Responsive Desktop / Tablet / Mobile UI
- تمام 169 ماژول Master Plan داخل Architecture Coverage ثبت شده‌اند
- فایل Master Architecture V6 داخل `docs/ARCHITECTURE_SOURCE_V6.txt` نگهداری شده است

## نکته خیلی مهم

این فایل «پایه اجرایی کل محصول» است، نه ادعای تکمیل تمام 169 ماژول Enterprise در یک مرحله.

از اینجا به بعد هر ماژول روی همین هسته اضافه می‌شود تا:
- Tenant و Branch دوباره طراحی نشوند.
- Login و Security دوباره طراحی نشوند.
- Role / Scope دوباره طراحی نشوند.
- Database Foundation دوباره ساخته نشود.
- SaaS Control Plane از Application Plane جدا بماند.

## فعلاً لازم نیست کاری انجام بدهی

هنگامی که خواستی روی Cloudflare آپلود کنیم، همین ZIP را نگه دار و در چت بگو:
**«حالا می‌خوام این نسخه رو روی Cloudflare راه‌اندازی کنیم.»**

آن مرحله را جدا و قدم‌به‌قدم انجام می‌دهیم.
