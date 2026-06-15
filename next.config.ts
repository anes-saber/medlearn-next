import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2|css)$)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
