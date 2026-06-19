/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy the Daml JSON Ledger API through the app's origin so browser HTTP calls
  // (query / create / exercise / readyz) are not blocked by CORS. WebSocket streaming
  // connects directly (WS is not subject to CORS).
  async rewrites() {
    const target = process.env.LEDGER_PROXY_TARGET ?? "http://localhost:7575";
    return [{ source: "/ledger/:path*", destination: `${target}/:path*` }];
  },
};

export default nextConfig;
