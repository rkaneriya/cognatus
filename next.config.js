module.exports = {
  webpack: function (config) {
    config.externals = config.externals || {}
    config.externals['styletron-server'] = 'styletron-server'
    return config
  },
  reactStrictMode: true,
  images: {
    domains: ['cdn.buymeacoffee.com'],
  },
  env: { 
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY, 
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
  }
}
