/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://genealeaderboard.github.io/",
  generateRobotsTxt: true,
  exclude: ["/3016305937616653569333637041687329300459960027609473183645834287473477392975/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", disallow: ["/3016305937616653569333637041687329300459960027609473183645834287473477392975/"] },
    ],
  },
}
