export default {
  title: 'JalaliTS',
  description: 'Jalali dates for TypeScript applications',
  cleanUrls: true,
  lastUpdated: true,
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'API', link: '/guide/api' },
          { text: 'Integrations', link: '/guide/integrations' },
        ],
        sidebar: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Core API', link: '/guide/api' },
          { text: 'Integrations', link: '/guide/integrations' },
          { text: 'Feature status', link: '/guide/feature-status' },
          { text: 'Migration and troubleshooting', link: '/guide/migration' },
        ],
      },
    },
    fa: {
      label: 'فارسی',
      lang: 'fa-IR',
      dir: 'rtl',
      themeConfig: {
        nav: [
          { text: 'راهنما', link: '/fa/guide' },
          { text: 'API', link: '/fa/api' },
        ],
        sidebar: [
          { text: 'شروع سریع', link: '/fa/guide' },
          { text: 'مرجع API', link: '/fa/api' },
          { text: 'یکپارچه‌سازی‌ها', link: '/fa/guide#یکپارچه‌سازی‌ها' },
          { text: 'وضعیت قابلیت‌ها', link: '/fa/guide#وضعیت-قابلیت‌ها' },
        ],
      },
    },
  },
};
