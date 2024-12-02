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
    domains: ['lh3.googleusercontent.com'], // Add this line
  },
  async headers() {
    return [
      {
        source: "/(.*)", // Match all routes
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp", // Enforce COEP
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin", // Protect your origin
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin", // Allow resources from any origin
          },
        ],
      },
    ];
  },
});
