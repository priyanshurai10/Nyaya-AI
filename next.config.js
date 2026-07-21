/** @type {import('next').NextConfig} */
const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : (process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://nyaya-ai-production-04ba.up.railway.app").trim();

console.log("Backend URL:", BACKEND_URL);

const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;