/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/gaming",
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  // allow the sandbox preview host to hit the dev server
  allowedDevOrigins: ["localhost", "127.0.0.1", "*.e2b.app", "*.e2b.dev"],
  eslint: { ignoreDuringBuilds: true },
  env: { NEXT_PUBLIC_BASE_PATH: "/gaming" },
};

export default nextConfig;
