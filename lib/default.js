exports.val = {
  siteName: "Sample Site",
  hostname: "localhost",
  port: 8080,
  useProxy: false,
  source: "src",
  target: "target",
  public: "public",
  favicon: "/images/favicon.png",

  templateFolder: "templates",
  defaultTemplate: "page.pug",
  templateEngine: "pug",

  widgetFolder: "widgets",

  homePage: "index.html",
  notFoundPage: "404.html",
  errorPage: "500.html",

  templateSitesFolder: "site-templates",
  defaultSiteFolder: "basic",

  siteEngine: "../fs/markdown-engine.js",
  markdownRender: "../markdown/bootstrap-markdown-render",
  markdownPage: "./../markdown/markdown-page",
  widgetRenderer: "../fs/widget-fs",
  configFile: "cocoons.json",
};
