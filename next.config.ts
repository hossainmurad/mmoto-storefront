import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      // add your Medusa / S3 / CDN host here for category and product images
    ],
  },
}

export default nextConfig
