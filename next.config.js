/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  /**
   * طبقة احتياطية: منع كاش المستندات على الاستضافات التي لا تمرّ كل الطلبات عبر middleware.
   * لا تُطبَّق على `/_next/static` (أسماء ملفات مشفّرة + immutable من Next).
   */
  async headers() {
    return [
      {
        source: '/:path((?!_next/static|_next/image).*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
