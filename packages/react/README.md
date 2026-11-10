# @jalalits/react

Headless React 19 hooks for Jalali date state, month grids, ranges, formatting, and countdowns. No UI components or global configuration are included.

```tsx
'use client';

import { useJalaliCalendar, useJalaliFormatter } from '@jalalits/react';

const calendar = useJalaliCalendar({ year: 1405, month: 8, timeZone: 'Asia/Tehran' });
const format = useJalaliFormatter('l j F');
```

Calendar hooks require explicit year and month, and countdowns render a stable empty snapshot until hydration unless `initialNow` is supplied. Timers start in effects and are cleared on unmount. Requires React 19 and `jalalits`.
