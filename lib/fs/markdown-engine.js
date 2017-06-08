
const p      = require("util");
const stat  = p.promisify(require("fs").stat);

const pt     = require("path");
const util   = require("../util");
const log    = require("../logger").Logger;


function init(app, config) {
  // Create the markdown services
  app.markdownRender = require(config.markdownRender);
  app.markdownPage = require(config.markdownPage);

  // init the widget template cache
  app.widgetRenderer = require(config.widgetRenderer);
  app.widgetRenderer.init(config);
}

async function get(req, res) {
  const path = getFilePath(req);
  try {

    if ( pt.extname(path) === util.HTML_EXTENSION) {

      let newPath = path.replace(util.HTML_EXTENSION, util.MD_EXTENSION);
      log.debug("Try to find a markdown file based on url : " + req.url + " => " + newPath);
      const stats = await stat(newPath);
      if (stats.isFile()) {
        log.debug("Markdown file found : " + newPath);
        await renderMarkdown(req, res, newPath);
      } else {
        //TODO : custom plugin ?
        log.debug("Markdown file not found : " + newPath);
        render404(res);
      }

    } else {
      //TODO : custom/plugin for a url without .html ?
      //       Manage error if path is a directory ?
      render404(res);
    }
  } catch (error) {
    log.error(error);
    renderError(new Error("Error when retrieving the page : " + path), res);
  }
}

function getFilePath(req, res) {

  return req.app.config.dirname + "/" + req.app.config.source +
       ((req.url === "/") ? getHomePage(req, res) : req.url);

}

function getHomePage(req, res) {
  if (req.app.config.homePage) {
    return "/" + req.app.config.homePage;
  } else {
       //TODO : add list of articles even if Blogging sucks ;-) ?
    render404(res);
  }
}

function render404(res) {
   //TODO : use a pug template
  res.status(404).send("Page not found ....");
}

function renderError(error, res) {
   //TODO : use a pug template
  res.status(500).send(error);
}

async function renderMarkdown(req, res, file) {
  try {
    const page = await req.app.markdownPage.readPage(file);

    let params = {
      "page": page,
      "config": req.app.config,
      file: file
    };

    params.widgets = req.app.widgetRenderer.renderWidgets(params);
    page.content = req.app.markdownRender.renderToHTML(params, page.content);


    if (!page.properties.template) {
      log.warn("Use the default template : " + req.app.config.defaultTemplate);
      page.properties.template = req.app.config.defaultTemplate;
    }

    res.render(page.properties.template, params);

  } catch (error) {
    renderError(error, res);
  }

}

exports.init = init;
exports.get = get;
