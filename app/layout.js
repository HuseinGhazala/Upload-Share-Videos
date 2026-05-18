import './globals.css';
import AppProviders from './providers/AppProviders';
import { Noto_Sans_Arabic } from 'next/font/google';

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'منصّة رفع الفيديو — تجربة سعودية احترافية',
  description:
    'ارفع فيديوهاتك وشاركها بسهولة عبر منصّة سعودية بأسعار واضحة بالريال، وحسابات محميّة وتفعيل سريع في نفس اليوم.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${notoArabic.className} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
