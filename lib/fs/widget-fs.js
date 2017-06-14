const p        = require("util");
const readdir  = p.promisify(require("fs").readdir);
const readFile = p.promisify(require("fs").readFile);
const watch    = p.promisify(require("fs").watch);
const _        = require("underscore");
const log      = require("../logger.js").Logger;
const util     = require("../util.js");

let widgetCache = null;
let widgetConfig = null;

/**
 *  Generate the HTML code for the different widgets.
 *  This is mainly used when the engine (preview or generate) is rendering a markdown page.
 *
 *  @params {json} : a json structure that contains the following attributes :
 *        - page   : information on the page (attributes & content)
 *        - config : the cocoons.io config info (matching to the file cocoons.json)
 *
 */
function renderWidgets(params) {
  try {
    var widgets = {};
    if (! params.config || ! params.config.widgets) {
      return widgets;
    }

    params.config.widgets.forEach(regionWidgets => {
      widgets[regionWidgets.region] = renderWidgetsForRegion(params,regionWidgets);
    });

    return widgets;
  } catch (error) {
    log.error(error);
    return [];
  }

}

/**
 * Render all widgets for one template region
 *
 * @param params that will used by the templates
 * @param the widget list region
 */
function renderWidgetsForRegion(params, regionWidgets) {
  var regionHTML = [];

  regionWidgets.widgets.forEach(widget => {
    var useThisWidget = true;
    if (widget.files) {
      useThisWidget = params.file.match(widget.files) !== null;
    }

    if (useThisWidget) {
      var htmlCode = renderHTML(params, widget);
      regionHTML.push({order : widget.order, html : htmlCode});
    }
  });

  return _.sortBy(regionHTML, function(widgetHTML){ return widgetHTML.order; });

}

/**
 * Render a widget into HTML
 *
 * This method has to synchronous because is used by the marked component that
 * do not support asynchronous process
 *
 * @param params that will used by the templates
 * @param the widget to render
 * @returns the HTML code
 */
function renderHTML(params, widget) {

  if (! widgetCache) {
    var error = "Impossible to generate the widget. Widget cache is not defined";
    log.error(error);
    throw error;
  }

  if (util.isHTMLFile(widget.name)) {
    return widgetCache.get(widget.name);
  }

  if (util.isPugFile(widget.name)) {
    var template = widgetCache.get(widget.name);
    if (template) {
      params.widget = widget;
      return template(params);
    }
    else {
      log.error("The widget " + widget.name +  " doesn't exist !");
      throw( "ERROR : " + "The widget " + widget.name +  " doesn't exist !");
    }

  }


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
 * Init the widget cache
 *
 * @param the cocoon config that match to the cocoons.json file
 *
 */
async function init(config) {
  try {
    widgetConfig = config;
    widgetCache = await readWidgetDirectory(config);

  }
  catch(error) {
    log.error("Error during reading the widget directory : " + error);
    //throw(new Error("Error during reading the widget directory : " + dir + " : " + error));
  }
  // Watching widget directory is not necessary
  // if we used nodemon for the preview mode
  //watchWidgetDirectory();
}

/**
 * Read the files into widget directory
 *
 * @param the cocoon config that match to the cocoons.json file
 * @param callback(error, htmlWidgets)
 *        htmlWidgets is an array of widgets (HTML or pug compile code) to set into the cache
 */
async function readWidgetDirectory(config) {

  var dir = config.dirname + "/" + config.widgetFolder;
  log.info("Read widgets from the directory : " + dir);

  const files = await readdir(dir);
  let widgetList = new Map();
  await Promise.all(files.map((file) => readWidget(dir, file, widgetList)));
  return widgetList;

}

async function readWidget(dir, file, widgetList) {

  const widgetFile = dir + "/" + file;

  if (util.isHTMLFile(file)) {
    const data = await readFile(widgetFile, "utf8");
    log.debug("HTML Widget added : " + widgetFile);
    widgetList.set(file, data);
    return;
  }

  if (util.isPugFile(file)) {
    const data = await util.compilePug(widgetFile);
    log.debug("Pug Widget added : " + widgetFile);
    widgetList.set(file, data);
    return;
  }

  throw new Error("Invalid widget format : " + file);

}

// -----------------------------------------------------------------------------------
// Check if a widget template file has been changed in order to refresh the cache
// important note :
// Watching widget directory is not necessary if we used nodemon for the preview mode
// -----------------------------------------------------------------------------------

function watchWidgetDirectory() {

  var widgetFolder = widgetConfig.dirname + "/" + widgetConfig.widgetFolder;
  watch(widgetFolder).then(() => refreshTemplateCache(widgetConfig));

}

module.exports.init = init;
module.exports.renderWidgets = renderWidgets;
module.exports.renderHTML = renderHTML;
