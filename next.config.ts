import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  images: { unoptimized: true },
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  webpack(config) {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/.data/**",
        "**/.npm-cache/**",
        "**/test-output/**",
        "**/node_modules/**",
        "**/.git/**",
      ],
    };
    return config;
  },
};
export default config;
