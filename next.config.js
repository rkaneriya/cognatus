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
  transpilePackages: [ "antd", "@antv", "@ant-design", "rc-util", "rc-pagination", "rc-picker", "rc-notification", "rc-field-form", "rc-tooltip", "rc-tree", "rc-table", "rc-input", "d3-interpolate" ],
}
