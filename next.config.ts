/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: [
          "lancar.s3.amazonaws.com",
          "localhost",
      ],
  },
};

export default nextConfig;