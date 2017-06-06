var fs    = require("fs");
var pt    = require("path");
var util  = require("../util");
var log   = require("../logger").Logger;


function init(app, config) {
  // Create the markdown services
  app.markdownRender = require(config.markdownRender);
  app.markdownPage = require(config.markdownPage);


  // init the widget template cache
  app.widgetRenderer = require(config.widgetRenderer);
  app.widgetRenderer.init(config);
}

function get(req, res) {

  let path = getFilePath(req);
  fs.exists(path, function(exists) {

    if (exists) {
      fs.stat(path, function(error, stats) {
        if (! stats.isFile()) {
          renderError(new Error("path exists but this is not a file"), res);
        }
      });
    } else {
      log.debug("Path (file or directory) not found : " + path);

          // Make a try to find a markdown content
      let extension = pt.extname(path);
      if (extension === util.HTML_EXTENSION) {

        let newPath = path.replace(util.HTML_EXTENSION, util.MD_EXTENSION);
        log.debug("Try to find a markdown file based on url : " + req.url + " => " + newPath);
        fs.exists(newPath, function(exists) {
          if (exists) {
            log.debug("Markdown file found : " + newPath);
            renderMarkdown(req, res, newPath);
          } else {
                      //TODO : custom plugin ?
            log.debug("Markdown file not found : " + newPath);
            render404(res);
          }
        });

      } else {

              //TODO : custom/plugin for a url without .html ?
        render404(res);
      }
    }

  });
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
  res.status(500).send("Error when retrieving the page : " + error);
}

function renderMarkdown(req, res, file) {

  req.app.markdownPage.readPage(file, function(error, page) {


    if (error) {
      renderError(error, res);
      return;
    }

    let params = {
      "page": page,
      "config": req.app.config,
      file: file
    };

    req.app.widgetRenderer.renderWidgets(params, function(error, htmlWidgets) {
      if (error) {
        renderError(error, res);
      }
      else {
        params.widgets = htmlWidgets;
        page.content = req.app.markdownRender.renderToHTML(page.content);

        if (!page.properties.template) {
          log.warn("Use the default template : " + req.app.config.defaultTemplate);
          page.properties = {
            "template": req.app.config.defaultTemplate
          };
        }

        res.render(page.properties.template, params);
      }

    });

  });

}

exports.init = init;
exports.get = get;
