/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  images: {
    domains: ['picsum.photos', 'lh3.googleusercontent.com', 'i.ibb.co'],
  },
};

module.exports = nextConfig;
