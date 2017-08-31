const p = require("util");
const readdir = p.promisify(require("fs").readdir);
const readFile = p.promisify(require("fs").readFile);
// const watch = p.promisify(require("fs").watch);
const _ = require("underscore");
const log = require("../logger.js").Logger;
const util = require("../util.js");

let widgetCache = null;

/**
 * renderWidgets - Generate the HTML code for the different widgets found in a page
 * Widget are displayed in different region of the page template (sidebar, top, bottom, ...)
 *
 * @param  {json} params a json structure that contains the following attributes :
 *        - page   : information on the page (attributes & content)
 *        - config : the cocoons.io config info (matching to the file cocoons.json)
 * @return {Object} with attributes matcing to a region
 *        and each region is a list of html code to display matching to the different widgets
 */
function renderWidgets(params) {
  try {
    const widgets = {};
    if (!params.config || !params.config.widgets) {
      return widgets;
    }

    params.config.widgets.forEach((regionWidgets) => {
      widgets[regionWidgets.region] = renderWidgetsForRegion(params, regionWidgets);
    });

    return widgets;
  } catch (error) {
    log.error(error);
    return {};
  }
}

/**
 * Render all widgets for one template region
 *
 * @param params that will used by the templates
 * @param the widget list region
 */


/**
 * renderWidgetsForRegion - Render all widgets for one template region
 *
 * @param  {Json} params a json structure that contains the following attributes :
 *        - page   : information on the page (attributes & content)
 *        - config : the cocoons.io config info (matching to the file cocoons.json)
 * @param  {String} regionWidgets the region name
 * @return {Array} a list of HTLM code matching to the widget of this region
 */
function renderWidgetsForRegion(params, regionWidgets) {
  const regionHTML = [];

  regionWidgets.widgets.forEach((widget) => {
    let useThisWidget = true;
    if (widget.files) {
      useThisWidget = params.path.match(widget.files) !== null;
    }

    if (useThisWidget) {
      const htmlCode = renderHTML(params, widget);
      regionHTML.push({ order: widget.order, html: htmlCode });
    }
  });

  return _.sortBy(regionHTML, widgetHTML => widgetHTML.order);
}


/**
 * renderHTML - Render a widget into HTML
 * This method has to synchronous because is used by the marked component that
 * do not support asynchronous process
 *
 * @param  {Json} params a json structure that contains the following attributes :
 *        - page   : information on the page (attributes & content)
 *        - config : the cocoons.io config info (matching to the file cocoons.json)
 * @param  {Object} widget The wodget to render
 * @return {String} The HTML code of the widget
 */
function renderHTML(params, widget) {
  if (!widgetCache) {
    const error = "Impossible to generate the widget. Widget cache is not defined";
    log.error(error);
    return "";
  }

  if (util.isHTMLFile(widget.name)) {
    return widgetCache.get(widget.name);
  }

  if (util.isPugFile(widget.name)) {
    const template = widgetCache.get(widget.name);
    if (template) {
      const pp = _.clone(params);
      pp.widget = widget;
      return template(pp);
    }
    log.error(`The widget ${widget.name} doesn't exist !`);
    return "";
  }
  log.error(`The widget ${widget.name} is not an HTML or a markdown file !`);
  return "";
}


// ---------------------------------------------------------------------------
//  The following methods can be used to create a cache of widgets.
//  If the widget is in HTML, the HTML code will add directly in the cache map.
//  If the widget is a pug template, the compiled version will be added in the cache map.
//
//  If the preview mode is running with nodemon, the cache is refreshed when a
//  template file is modified (with the nodemon options : -e js,json,pug)
//
//  Otherwise it is possible to call the watchWidgetDirectory when the preview
//  engine is starting
//
// ----------------------------------------------------------------------------


/**
 * init - Init this widget management component
 *
 * @param  {JSON} config The json matching to the cocoons.json file
 * @return {undefined} -
 */
async function init(config) {
  try {
    widgetCache = await readWidgetDirectory(config);
  } catch (error) {
    log.error(`Error during reading the widget directory : ${error}`);
    // throw(new Error("Error during reading the widget directory : " + dir + " : " + error));
  }
  // Watching widget directory is not necessary
  // if we used nodemon for the preview mode
  // watchWidgetDirectory();
}

/**
 * Read the files into widget directory
 *
 * @param the cocoon config that match to the cocoons.json file
 * @param callback(error, htmlWidgets)
 *        htmlWidgets is an array of widgets (HTML or pug compile code) to set into the cache
 */


/**
 * readWidgetDirectory - Read the files into widget directory
 *
 * @param  {JSON} config The json matching to the cocoons.json file
 * @return {Array} The widgets found in the directory
 */
async function readWidgetDirectory(config) {
  const dir = `${config.dirname}/${config.widgetFolder}`;
  log.info(`Read widgets from the directory : ${dir}`);

  const files = await readdir(dir);
  const widgetList = new Map();
  await Promise.all(files.map(file => readWidget(dir, file, widgetList)));
  return widgetList;
}


/**
 * readWidget - Read one widget from a file
 *
 * @param  {String} dir The widget directory path
 * @param  {String} file The name of the file to read
 * @param  {type} widgetList The current widget list
 * @return {undefined} -
 */
async function readWidget(dir, file, widgetList) {
  const widgetFile = `${dir}/${file}`;

  if (util.isHTMLFile(file)) {
    const data = await readFile(widgetFile, "utf8");
    log.debug(`HTML Widget added : ${widgetFile}`);
    widgetList.set(file, data);
    return;
  }

  if (util.isPugFile(file)) {
    const data = await util.compilePug(widgetFile);
    log.debug(`Pug Widget added : ${widgetFile}`);
    widgetList.set(file, data);
    return;
  }

  throw new Error(`Invalid widget format : ${file}`);
}

module.exports.init = init;
module.exports.renderWidgets = renderWidgets;
module.exports.renderHTML = renderHTML;
