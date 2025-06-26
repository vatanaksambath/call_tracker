import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Correct placement for the redirects function
  async redirects() {
    return [
      {
        source: '/',           // When the user tries to access the root URL
        destination: '/signin', // Redirect them to the /login page
        permanent: true,       // Use 'true' for a permanent 308 redirect
      },
    ];
  },
  webpack(config) {
    // Your webpack rules go here
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;