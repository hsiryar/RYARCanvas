/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (process.env.NODE_ENV === "production" ? "/gaming" : "");

const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // allow the sandbox preview host to hit the dev server
  allowedDevOrigins: ["localhost", "127.0.0.1", "*.e2b.app", "*.e2b.dev"],
  eslint: { ignoreDuringBuilds: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
