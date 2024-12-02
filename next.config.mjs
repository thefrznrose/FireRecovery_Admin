import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'], // Allow Google's image domain
  },
  async headers() {
    return [
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups", // Allow popups to interact with your app
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none", // Disable embedding restrictions for third-party content
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin", // Allow loading third-party resources
          },
        ],
      },
    ];
  },
});
