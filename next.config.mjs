/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle missing modules gracefully
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }

    // Optimize bundle size
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@vercel/analytics': false,
        'framer-motion': false,
      }
    }

    // Bundle analyzer support
    if (!isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../bundle-analysis.html',
        })
      )
    }

    return config
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
    gzipSize: true,
  },

  transpilePackages: [],

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  compress: true,
  poweredByHeader: false,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ]
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
