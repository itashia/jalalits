import type { ReactNode } from 'react';
import type { JSX } from 'react';

export default function RootLayout({ children }: { readonly children: ReactNode }): JSX.Element {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
