import './globals.css';

export const metadata = {
  title: 'Video Upload App',
  description: 'Upload and share videos (GitHub or local storage)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
