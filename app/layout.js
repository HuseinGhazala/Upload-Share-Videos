import './globals.css';
import AppProviders from './providers/AppProviders';
import MobileBottomNav from './components/MobileBottomNav';
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['latin', 'arabic'], // Added arabic support
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata = {
  title: 'منصّة رفع الفيديو — تجربة سعودية احترافية',
  description:
    'ارفع فيديوهاتك وصورك وشاركها بسهولة — روابط آمنة، QR Code، ورفع من الموبايل.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'رفع فيديو',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${cairo.variable} antialiased font-body-md bg-surface text-on-surface`}>
        <AppProviders>
          {children}
          <MobileBottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
