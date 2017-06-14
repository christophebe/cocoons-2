const pt     = require("path");
const p      = require("util");
const stat   = p.promisify(require("fs").stat);
const fs     = require("fs-extra");
const log    = require("../logger").Logger;
const val    = require("../default").val;


const SITE_TEMPLATES_FOLDER = val.templateSitesFolder;
const DEFAULT_SITE_TEMPLATE = SITE_TEMPLATES_FOLDER + "/" + val.defaultSiteFolder;

const DEFAULT_WIDGET_FOLDER = val.widgetFolder;
const TEMPLATE_DEFAULT_WIDGET_FOLDER = SITE_TEMPLATES_FOLDER + "/" + DEFAULT_WIDGET_FOLDER;


/**
 * Public method of this module.
 * Create a new web site in the current directory or in a specific one
 * The creation of a new site is based on a site template that match to a folder.
 * By default, we use the DEFAULT_SITE_TEMPLATE folder.
 *
 * The content of this template folder is copying inside the folder used
 * for the new web site.
 *
 * @param the name of the site template to used for creating the new website
 * @param the path used to create the site
 * @return a Promise used to catch eventually an error
 */
async function createSite(siteTemplateName, websiteFolder = process.cwd()) {

  const options = {
    filter : function(name) {
      return name.indexOf("target") < 0;
    },
    clobber : false

  };

  log.info("Create a new web site in the folder : " + websiteFolder);

  const siteTemplateFolder = pt.resolve(__dirname, "../..", siteTemplateName ? SITE_TEMPLATES_FOLDER + "/" + siteTemplateName : DEFAULT_SITE_TEMPLATE);

  // if the template directory doesn't exist => the function stat throws an error
  try {
    await stat(siteTemplateFolder);
    // No error, we can create the site structure
    const t = createTemplateDirectory(siteTemplateFolder, websiteFolder, options);
    const w = createWidgetDirectory(websiteFolder, options);
    return await Promise.all([t, w]);
  }
  catch(error) {
    return Promise.reject(new Error("Impossible to create the site - check if the template exists : " + siteTemplateName));
  }

}

function createTemplateDirectory(siteTemplateFolder, websiteFolder, options) {
  log.info("Use site template in : " + siteTemplateFolder);
  return fs.copy(siteTemplateFolder, websiteFolder, options);
}

function createWidgetDirectory(websiteFolder, options) {
  const widgetTemplateFolder = pt.resolve(__dirname, "../..", TEMPLATE_DEFAULT_WIDGET_FOLDER);
  log.info("Use widget templates in : " + widgetTemplateFolder);
  return fs.copy(widgetTemplateFolder, websiteFolder + "/" + DEFAULT_WIDGET_FOLDER , options);
}

exports.createSite = createSite;
