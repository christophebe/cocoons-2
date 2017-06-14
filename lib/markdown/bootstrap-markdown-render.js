const marked = require("marked");
const widgetRenderer = require("../fs/widget-fs.js");

const log = require("../logger.js").Logger;

/**
 *
 *  Render into HTML a markdown content. This content can have some widgets.
 *
 * @param {json} : the params used to generate the markdown content with the following fields :
 *        - page: the informations about the page :
              - properties
              - content
 *        - config: the cocoons config structure
 * @callback
 */
function renderToHTML(params, markdownContent) {
  const renderer = createRenderer(params);
  return marked(markdownContent, {renderer: renderer});
}

function createRenderer(params) {

  let renderer = new marked.Renderer();
  renderer.params = params;
  /**
   * Add bootstrap class for a markdown table
   * See the marked documentation for more details
   */
  renderer.table = function(header, body) {
    return "<table class='table table-striped table-bordered'>\n" +
      "<thead>\n" +
      header +
      "</thead>\n" +
      "<tbody>\n" +
      body +
      "</tbody>\n" +
      "</table>\n";
  };

  /**
   * Add support for nofollow link with the following markdown syntax :
   * [ancho](nofollow:url)
   *
   */
  renderer.link = function(href, title, text) {

    var relAttribute = "";

    //Check if href contains nofollow prefix
    if (href.indexOf("nofollow:") === 0) {
      href = href.substring(9);
      relAttribute = "rel=nofollow";
    }

    if (this.options.sanitize) {
      var prot;
      try {
        prot = decodeURIComponent(unescape(href))
          .replace(/[^\w:]/g, "")
          .toLowerCase();
      } catch (e) {
        return "";
      }
      if (prot.indexOf("javascript:") === 0) {
        return "";
      }
    }

    var out = "<a " + relAttribute + " href=\"" + href + "\"";
    if (title) {
      out += " title=\"" + title + "\"";
    }
    out += ">" + text + "</a>";
    return out;
  };

  /**
   * Render a code section/tag into widget or usual output for code
   * See the marked documentation for more details
   */
  renderer.code = function(code, lang, escaped) {

    escaped = true;

    if (lang && lang === "widget") {
      //log.debug(code);
      return this.renderWidget(code);
    } else {
      return this.renderCode(code, lang, escaped);
    }

  };

  /**
   * Render a widget
   * The code inserted in the markdown content has to be in the json format
   *
   * @param the json code that contains widget params
   * @return the HTML code that match to the widget rendering
   *
   */
  renderer.renderWidget = function(widgetCode) {

    try {

      let widget = JSON.parse(widgetCode);
      return widgetRenderer.renderHTML(this.params, widget);

    } catch (e) {
      const errorMessage = "Impossible to parse the json structure for the widget content : " +
        widgetCode + " - error : " + e;
      log.error(errorMessage );
      return "widget error\n";

    }


  };

  /**
   * Render a code snippet
   *
   * See the marked documentation for more details
   */
  renderer.renderCode = function(code, lang, escaped) {
    if (this.options.highlight) {
      var out = this.options.highlight(code, lang);
      if (out !== null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      return "<pre><code>" +
        (escaped ? code : escape(code, true)) +
        "\n</code></pre>";
    }

    return "<pre><code class=\"" +
      this.options.langPrefix +
      escape(lang, true) +
      "\">" +
      (escaped ? code : escape(code, true)) +
      "\n</code></pre>\n";
  };

  return renderer;
}


module.exports.renderToHTML = renderToHTML;
