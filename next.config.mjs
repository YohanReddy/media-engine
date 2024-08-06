/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://salt-api-prod.getsalt.ai/api/v1/:path*', // Proxy to Salt API
        },
      ];
    },
  };
  
  export default nextConfig;
  