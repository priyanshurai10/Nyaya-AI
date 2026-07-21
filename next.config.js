/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    let backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nyaya-ai-production-04ba.up.railway.app').trim();
    if (process.env.NODE_ENV === 'development') {
      backendUrl = 'http://127.0.0.1:8000';
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
