/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Optimize for Vercel deployment
  swcMinify: true,
  // Enable static optimization
  output: 'standalone',
  // Optimize 3D model loading
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei'],
  },
}

module.exports = nextConfig
