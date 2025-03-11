import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/authentication', // Replace with your desired path
        permanent: true, // true for 308 status code, false for 307
      },
    ];
  },
};

export default nextConfig;
