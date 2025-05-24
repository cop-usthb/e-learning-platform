/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Correction: serverComponentsExternalPackages → serverExternalPackages
  serverExternalPackages: ['mongodb', '@mongodb-js/zstd'],
}

export default nextConfig
