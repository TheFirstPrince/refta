import './globals.css';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
