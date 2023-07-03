const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: false,
  i18n: {
    locales: ['ru-RU',],
    defaultLocale: "ru-RU",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    instrumentationHook: true
  },
});
