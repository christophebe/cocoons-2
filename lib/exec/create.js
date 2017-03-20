const pt    = require('path');
const blue  = require('bluebird');
const ncp   = blue.promisify(require("ncp").ncp);
const log   = require('../logger').Logger;
const val   = require('../default').val;


const SITE_TEMPLATES_FOLDER = val.templateSitesFolder;
const DEFAULT_SITE =  SITE_TEMPLATES_FOLDER + "/" + val.defaultSiteFolder;

const DEFAULT_WIDGET_FOLDER = val.widgetFolder;
const TEMPLATE_DEFAULT_WIDGET_FOLDER = SITE_TEMPLATES_FOLDER + "/" + DEFAULT_WIDGET_FOLDER;


/**
 * Public method of this component.
 * Create a new web site in the current directory or in a specified directory
 * The creation of a new site is based on a  site template that match to a folder
 * By default, we use the DEFAULT_SITE folder.
 *
 * the content of this template folder is copying inside the folder used
 * for the new web site (current directory).
 *
 * @param the name of the site template to used for creating the new website
 * @param the path used to create the site (if null => use the current directory)
 * @param callback(error)
 */
async function createSite(siteTemplateName, websiteFolder) {

  // By default the site is created in the current folder
  if (! websiteFolder){
    websiteFolder = process.cwd();
  }

  const options = {
    filter : function(name) {
        return name.indexOf("target") < 0;
    },
    clobber : false

  };
  log.info("Create a new web site in the folder : " + websiteFolder);

  const t = createTemplateDirectory(siteTemplateName, websiteFolder, options );
  const w = createWidgetDirectory(websiteFolder, options);
  return await Promise.all([t, w]);

}

async function createTemplateDirectory(siteTemplateName, websiteFolder, options ) {
  const siteTemplateFolder = pt.resolve(__dirname, '../..', siteTemplateName ? SITE_TEMPLATES_FOLDER + "/" + siteTemplateName : DEFAULT_SITE);
  log.info("Use site template in : " + siteTemplateFolder);
  await ncp(siteTemplateFolder, websiteFolder, options);
}

async function createWidgetDirectory(websiteFolder, options) {
  const widgetTemplateFolder = pt.resolve(__dirname, '../..', TEMPLATE_DEFAULT_WIDGET_FOLDER);
  log.debug("Use widget templates in : " + widgetTemplateFolder);
  await ncp(widgetTemplateFolder, websiteFolder + "/" + DEFAULT_WIDGET_FOLDER, options);

}

exports.createSite = createSite;
