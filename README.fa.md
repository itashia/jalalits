# JalaliTS

**JalaliTS** یک کتابخانهٔ مدرن، قدرتمند و بدون وابستگی زمان اجرا برای تاریخ و زمان فارسی (جلالی) است که با TypeScript ساخته شده است. بستهٔ `jalalits` هستهٔ تقویم و تاریخ‌وزمان تغییرناپذیر را ارائه می‌کند و بسته‌های جداگانه‌ای برای React، Zod، Temporal و مرزهای API دارد.

```ts
import { JalaliDateTime } from 'jalalits';

const nowruz = JalaliDateTime.parse('1405/01/01', 'Asia/Tehran');
nowruz.addMonths(1).format('l j F Y');
```

تقویم از مدل سال‌های شکست بورکوفسکی و بازهٔ سال‌های ۱ تا ۳۱۷۷ استفاده می‌کند. برای توسعه به Node.js 22 یا بالاتر و pnpm 10 نیاز است. دستورهای اصلی `pnpm build`، `pnpm test`، `pnpm lint` و `pnpm typecheck` هستند.

برای نصب بستهٔ اصلی اجرا کنید: `npm install jalalits`.

بسته‌های منتشرشدنی این workspace شامل `jalalits`، `@jalalits/react`، `@jalalits/zod`، `@jalalits/temporal` و `@jalalits/api` هستند. بازه‌های تاریخ، تکرار، تقویم کاری و پردازش زبان طبیعی در این نسخه ارائه نشده‌اند. مستندات فارسی در [راهنمای وب](./apps/docs/site/fa/index.md) و نمونه‌های اجرایی در پوشهٔ `examples` قرار دارند.
