import WatchClient from './WatchClient';

export const metadata = {
  title: 'مشاهدة المحتوى',
  description: 'صفحة مشاهدة فيديو أو صورة مشتركة.',
};

export default async function WatchPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const accessToken = typeof sp?.accessToken === 'string' ? sp.accessToken : undefined;
  return <WatchClient id={id} accessToken={accessToken} />;
}
