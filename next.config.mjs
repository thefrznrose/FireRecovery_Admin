import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: process.env.IMAGE_DOMAINS
      ? process.env.IMAGE_DOMAINS.split(",")
      : ["lh3.googleusercontent.com"],
      // unoptimized: true,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '', // Optional: specify the port if needed
          pathname: '/**', // Optional: define specific paths
        },
        {
          protocol: 'https',
          hostname: 'another-domain.com',
          pathname: '/**',
        },
      ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
});
