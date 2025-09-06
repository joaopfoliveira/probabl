/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://betting-tips-ai.com',
  generateRobotsTxt: false, // We have a custom robots.ts
  exclude: ['/admin', '/api/*'],
  additionalPaths: async (config) => {
    // No additional static paths needed since we use app router
    return []
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    }
  },
}
