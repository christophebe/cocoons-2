
const p = require("util");
const stat = p.promisify(require("fs").stat);
const pt = require("path");
const util = require("../util");
const log = require("../logger").Logger;

/**
 *  Core engine used to generate the HTML content based on markdown file
 */

// Use setImmediate because both functions (renderWidgets & renderToHTML) are synchronous
const pWidget = (params, widgetRenderer) =>  new Promise(resolve => setImmediate(() => resolve(widgetRenderer.renderWidgets(params))));
const pContent = (params, content, markdownRender) => new Promise(resolve => setImmediate(() => resolve(markdownRender.renderToHTML(params, content))));

/**
 * init - Init the engine
 *
 * @param  {Object} app The express app
 * @param  {Json} config the config mapping the cocoons.json file
 * @return {undefined}
 */
function init(app, config) {
  // Create the markdown services
  // Need to find a better solution for managing the different modules
  app.markdownRender = require(config.markdownRender);
  app.markdownPage = require(config.markdownPage);

  // init the widget template cache
  app.widgetRenderer = require(config.widgetRenderer);
  app.widgetRenderer.init(config);
}

/**
 * get - Render an url/resouce that match to a markdown content
 *
 * @param  {Object} req The express request
 * @param  {Object} res The express response
 * @return {undefined}
 */
async function get(req, res) {
  const path = getFilePath(req);
  try {
    if (pt.extname(path) === util.HTML_EXTENSION) {
      const newPath = path.replace(util.HTML_EXTENSION, util.MD_EXTENSION);
      log.debug(`Try to find a markdown file based on url : ${req.url} => ${newPath}`);
      const stats = await stat(newPath);
      if (stats.isFile()) {
        log.debug(`Markdown file found : ${newPath}`);
        await renderMarkdown(req, res, newPath);
      } else {
        log.debug(`Markdown file not found : ${newPath}`);
        render404(res);
      }
    } else {
      // TODO : custom/plugin for a url without .html ?
      //       Manage error if path is a directory ?
      render404(res);
    }
  } catch (error) {
    log.error(error);
    renderError(new Error(`Error when retrieving the page : ${path}`), res);
  }
}


/**
 * getFilePath - get the path of the local file matching to the url request
 *
 * @param  {Object} req The express request
 * @param  {Object} res The express response
 * @return {String} the file path
 */
function getFilePath(req, res) {
  return `${req.app.config.dirname}/${req.app.config.source}${(req.url === "/") ? getHomePage(req, res) : req.url}`;
}


/**
 * getHomePage - get the path of the local file matching to the home page
 *
 * @param  {Object} req The express request
 * @param  {Object} res The express response
 * @return {String} the file path
 */
function getHomePage(req, res) {
  if (req.app.config.homePage) {
    return `/${req.app.config.homePage}`;
  }
  render404(res);
  return "";
}


/**
 * render404 - Render an 404 HTML page
 *
 * @param  {Object} res The express response
 * @return {undefined} -
 */
function render404(res) {
  // TODO : use a pug template
  res.status(404).send("Page not found ....");
}


/**
 * renderError - Render an Error HTML page
 *
 * @param  {Object} error the error to display on the page
 * @param  {Object} res The express response
 * @return {undefined} -
 */
function renderError(error, res) {
  // TODO : use a pug template
  res.status(500).send(error);
}


/**
 * renderMarkdown - Render a markdown content into HTML content
 *
 * @param  {Object} req The express request
 * @param  {Object} res The express response
 * @param  {type} path the path of the markdown file
 * @return {undefined} -
 */
async function renderMarkdown(req, res, path) {
  try {
    const page = await req.app.markdownPage.readPage(path);

    const params = {
      page,
      config: req.app.config,
      path,
    };

    // Transform the markdown content into HTML & Render the whole page based on the plug template
    const [widgets, content] = await Promise.all([
      pWidget(params, req.app.widgetRenderer),
      pContent(params, page.content, req.app.markdownRender),
    ]);
    params.widgets = widgets;
    page.content = content;

    if (!page.properties.template) {
      log.warn(`Use the default template : ${req.app.config.defaultTemplate}`);
      page.properties.template = req.app.config.defaultTemplate;
    }

    res.render(page.properties.template, params);
  } catch (error) {
    renderError(error, res);
  }
}

exports.init = init;
exports.get = get;
