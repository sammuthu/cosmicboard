import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/mastery/leetcode',
        destination: '/mastery/algorithms',
        permanent: true,
      },
      {
        source: '/mastery/leetcode/:path*',
        destination: '/mastery/algorithms/:path*',
        permanent: true,
      },
      // Redirect old problem URLs to new ones
      {
        source: '/mastery/algorithms/1_Two_Sum_Problem',
        destination: '/mastery/algorithms/array-awakening',
        permanent: true,
      },
      {
        source: '/mastery/algorithms/2_Add_Two_Numbers',
        destination: '/mastery/algorithms/linked-consciousness',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
