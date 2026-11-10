# جلالی‌جی‌اس

هستهٔ تغییرناپذیر تقویم جلالی برای برنامه‌های TypeScript به‌همراه افزونه‌های مستقل React، Zod، Temporal و مرزهای API.

```ts
import { JalaliDateTime } from 'jalalits';

const date = JalaliDateTime.parse('۱۴۰۵/۰۸/۱۹', 'Asia/Tehran');
date.format('l j F Y');
```

تقویم از مدل سال‌های شکست بورکوفسکی و بازهٔ سال‌های ۱ تا ۳۱۷۷ استفاده می‌کند. برای شروع به [راهنما](/fa/guide) بروید.
