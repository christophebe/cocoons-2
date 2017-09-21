const pt = require("path");
const log = require("cocoons-util/logger").Logger;
const util = require("cocoons-util/util");
const defaults = require("cocoons-util/default").val;

const CONFIG_FILE = defaults.configFile;

const getTargetFolder = config => `${config.dirname}/${config.target}`;

const toTargetFolder = (config, path) => {
  if (path.includes(config.source)) {
    return path.replace(config.source, config.target);
  }
  return path.replace(config.public, config.target);
};

let markdownRender = null;
let widgetRenderer = null;
let markdownPage = null;

/**
 * generateSite - Generate a static web site based
 *
 * @param {string} websiteFolder the folder containing the cocoons files
 * @return {promise}  The status of the generation
 */
async function generateSite(websiteFolder) {
  log.debug(`Try to find the cocoons config file : ${websiteFolder}/${CONFIG_FILE}`);
  const config = Object.assign({}, defaults, await util.readJsonFile(`${websiteFolder}/${CONFIG_FILE}`));
  config.dirname = websiteFolder;

  log.info(`Starting site generation from : ${config.dirname}`);

  // find a better way to load dynamically modules
  markdownRender = require(config.markdownRender);
  widgetRenderer = require(config.widgetRenderer);
  markdownPage = require(config.markdownPage);

  await widgetRenderer.init(config);

  log.debug(`Reinit target folder : ${getTargetFolder(config)}`);
  await util.removeAndCreateDirectory(getTargetFolder(config));
  return startSiteGeneration(config);
}


/**
 * startSiteGeneration - Generate the complete website
 *
 * @param  {json} config The cocoons config file
 * @return {promise} The status of the generation
 */
async function startSiteGeneration(config) {
  const htaccess = generateHtaccess(config);
  const copySource = readDir(config, `${config.dirname}/${config.source}`);
  const copyPublic = readDir(config, `${config.dirname}/${config.public}`);
  return Promise.all([htaccess, copySource, copyPublic]);
}

/**
 * readDir - Read a source directory in order to copy it into the target folder
 *
 * @param  {json} config The cocoons config file
 * @param  {string} dir The source dir path
 * @param  {function} targetFunction description
 * @return {promise} The status
 */
async function readDir(config, dir) {
  log.debug(`Read the folder : ${dir}`);
  const files = await util.readDir(dir);

  const promises = files.map(file => copyToTarget(config, `${dir}/${file}`));
  return Promise.all(promises);
}

/**
 * copyToTarget - Copy a file or a subdirectory into the target folder
 *
 * @param  {json} config The cocoons config file
 * @param  {string} path The path of the file or of the subdirectory
 * @param  {function} targetFunction description
 * @return {promise} the status of the operation
 */
async function copyToTarget(config, path) {
  log.debug(`copyToTarget : ${path}`);

  const stats = await util.stat(path);

  if (stats.isFile()) {
    if (util.isMarkdownFile(path)) {
      return copyMarkdownFile(config, path);
    }

    if (util.isJsonFile(path)) {
      return copyJsonFile(config, path);
    }
    return util.copyFile(path, toTargetFolder(config, path));
  }

  if (stats.isDirectory()) {
    await util.mkDir(toTargetFolder(config, path));
    return readDir(config, path);
  }

  return Promise.resolve();
}


/**
 * copyMarkdownFile - Generate a md file into HTML and copy it into the target folder
 *
 * @param  {json} config The cocoons config file
 * @param  {string} file the md file path
 * @return {promise} the status of the operation
 */
async function copyMarkdownFile(config, file) {
  const params = {
    page: await markdownPage.readPage(file),
    config,
    file,
  };
  params.widgets = await widgetRenderer.renderWidgets(params);

  params.page.content = markdownRender.renderToHTML(params, params.page.content);
  if (!params.page.properties.template) {
    log.warn(`Template property is not defined. Use the default template : ${config.defaultTemplate} for file : ${file}`);
    params.page.properties.template = config.defaultTemplate;
  } else {
    log.debug(`Use the template : ${params.page.properties.template} for file : ${file}`);
  }

  const templateFile = `${config.dirname}/${config.templateFolder}/${params.page.properties.template}`;
  const html = await util.renderFile(templateFile, params);
  const targetPath = toTargetFolder(config, file.replace(util.MD_EXTENSION, util.HTML_EXTENSION));

  return util.writeFile(targetPath, html);
}


/**
 * copyJsonFile -  Copy a json file into the target folder if it is not a property file
 * for a markdown file
 *
 * @param  {json} config The cocoons config file
 * @param  {string} file the md file path
 * @return {promise} the status of the operation
 */
async function copyJsonFile(config, file) {
  // if a md file exists for this json file
  //= > don't copy because it is its property file
  return util.stat(file.replace(util.JSON_EXTENSION, util.MD_EXTENSION))
    .catch(() => util.copyFile(file, toTargetFolder(config, file)));
}

/**
 * generateHtaccess - Generate the htaccess
 *
 * @param  {json} config The cocoons config file
 * @return {promise} The status of the generation
 */
async function generateHtaccess(config) {
  log.debug("Generate htaccess");
  if (config.htaccess && config.htaccess.generate) {
    const htaccessTemplate = `${pt.resolve(__dirname, "../..", "site-templates/htaccess")}/htaccess.jade`;
    const cloakingRules = [];
    /*
    // TODO : Add support for cloaking
    if (config.cloaks) {
      cloakingRules = generateCloakingRules(config);
    }
    */

    return util.renderFile(htaccessTemplate, { config, cloakingRules })
      .then(file => util.writeFile(`${getTargetFolder(config)}/.htaccess`, file))
      .catch(error => new Error(`Error during the generation of htaccess :${error}`));
  }
  return Promise.resolve();
}

exports.generateSite = generateSite;
