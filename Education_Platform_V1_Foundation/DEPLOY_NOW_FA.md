# دیپلوی همین نسخه روی Cloudflare — بدون نصب Node روی کامپیوتر

این پکیج برای دیتابیس D1 شما تنظیم شده است:

- Database name: `education-platform`
- Database ID: `cbc4566c-936d-4a1b-91ee-d26e82c0d578`
- Worker name: `education-platform-v1`

## روش پیشنهادی: GitHub + Cloudflare Workers Builds

### 1) GitHub
1. در GitHub یک Repository جدید بسازید، ترجیحاً Private.
2. فایل ZIP را Extract کنید.
3. محتویات داخل پوشه `Education_Platform_V1_Foundation` را در ریشه Repository آپلود کنید.
4. Commit کنید.

### 2) Cloudflare
1. به `Workers & Pages` بروید.
2. گزینه Create / Import repository را انتخاب کنید.
3. GitHub را متصل و Repository همین پروژه را انتخاب کنید.
4. Production branch را `main` بگذارید.
5. Build command را `npm run build` بگذارید.
6. Deploy command را `npm run deploy` بگذارید.
7. Root directory باید `/` یا خالی باشد چون package.json در ریشه است.
8. Deploy را بزنید.

`npm run deploy` قبل از انتشار Worker، migrationهای D1 را روی دیتابیس remote اعمال می‌کند و سپس Worker را deploy می‌کند.

### 3) بعد از موفق شدن Deploy
1. URL `*.workers.dev` را باز کنید.
2. چون دیتابیس خالی است، صفحه ساخت اولین Platform Owner نمایش داده می‌شود.
3. نام، ایمیل و یک رمز قوی وارد کنید.
4. بعد از ورود، اولین Customer / Tenant و Branch آزمایشی را ایجاد کنید.

## اگر Build یا Migration خطا داد
هیچ فایل یا تنظیم دیگری را تغییر ندهید. متن کامل خطا یا Screenshot را برای ChatGPT بفرستید تا همان مرحله اصلاح شود.

## نکات امنیتی
- هیچ API Token یا رمز Cloudflare داخل Repository قرار ندهید.
- Repository را در شروع Private نگه دارید.
- اولین Platform Owner را فقط با ایمیل خودتان بسازید.
