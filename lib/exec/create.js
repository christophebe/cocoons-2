const pt = require("path");
const p = require("util");
const stat = p.promisify(require("fs").stat);
const fs = require("fs-extra");
const log = require("cocoons-util/logger").Logger;
const val = require("cocoons-util/default").val;

const SITE_TEMPLATES_FOLDER = val.templateSitesFolder;
const DEFAULT_SITE_TEMPLATE = `${SITE_TEMPLATES_FOLDER}/${val.defaultSiteFolder}`;

const DEFAULT_WIDGET_FOLDER = val.widgetFolder;
const TEMPLATE_DEFAULT_WIDGET_FOLDER = `${SITE_TEMPLATES_FOLDER}/${DEFAULT_WIDGET_FOLDER}`;


/**
 * createSite - Create a new sote in a folder based on a template
 *
 * @param  {String} siteTemplateName The template to use
 * @param  {String} websiteFolder = process.cwd() The targeted folder or the current one
 * @return {Promise} a promise with the status of the operation
 */
async function createSite(siteTemplateName, websiteFolder = process.cwd()) {
  const options = {
    clobber: true,
    filter(name) { return name.indexOf("target") < 0; },
  };

  log.info(`Create a new web site in the folder ${websiteFolder}`);

  const siteTemplateFolder = pt.resolve(__dirname, "../..", siteTemplateName ? `${SITE_TEMPLATES_FOLDER}/${siteTemplateName}` : DEFAULT_SITE_TEMPLATE);

  // if the template directory doesn't exist => the function stat throws an error
  try {
    await stat(siteTemplateFolder);
    // No error, we can create the site structure
    const t = copyTemplateDirectory(siteTemplateFolder, websiteFolder, options);
    const w = createWidgetDirectory(websiteFolder, options);
    return await Promise.all([t, w]);
  } catch (error) {
    return Promise.reject(new Error(`Impossible to create the site - check if the template exists : ${siteTemplateName}`));
  }
}

/**
 * copyTemplateDirectory - copy the template site structure into a target folder
 *
 * @param  {String} siteTemplateFolder the folder that contains the site template to copy
 * @param  {String} websiteFolder the target folder in which the template will be copied
 * @param  {Json} options the usual fs-extra options
 * @return {Promise} the status of the operation
 */
function copyTemplateDirectory(siteTemplateFolder, websiteFolder, options) {
  log.info(`Use site template in ${siteTemplateFolder}`);
  return fs.copy(siteTemplateFolder, websiteFolder, options);
}


/**
 * createWidgetDirectory - Copy the defaults widgets into a target folder
 *
 * @param  {String} websiteFolder the folder that contains the site template to copy
 * @param  {Json} options the target folder in which the template will be copied
 * @return {Promise} the status of the operation
 */
function createWidgetDirectory(websiteFolder, options) {
  const widgetTemplateFolder = pt.resolve(__dirname, "../..", TEMPLATE_DEFAULT_WIDGET_FOLDER);
  log.info(`Use widget templates in ${widgetTemplateFolder}`);
  return fs.copy(widgetTemplateFolder, `${websiteFolder}/${DEFAULT_WIDGET_FOLDER}`, options);
}


exports.createSite = createSite;
