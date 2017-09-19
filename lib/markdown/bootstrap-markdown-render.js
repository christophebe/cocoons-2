const marked = require("marked");
const widgetRenderer = require("../fs/widget-fs.js");

const log = require("cocoons-util/logger.js").Logger;

/**
 * renderToHTML - Render into HTML a markdown content. This content can have some widgets.
 *
 * @param  {json} params the params used to generate the markdown content with the following fields :
 *        - page: the informations about the page :
 *            - properties
 *            - content
 *        - config: the cocoons config structure
 * @param  {String} markdownContent the content in the markdown format
 * @return {type} the html content
 */
function renderToHTML(params, markdownContent) {
  const renderer = createRenderer(params);
  return marked(markdownContent, { renderer });
}


/**
 * createRenderer - Create a specific render mainly the table rendering
 *
 * @param  {json} params the params used to generate the markdown content
 * @return {object} the custom render
 */
function createRenderer(params) {
  const renderer = new marked.Renderer();
  renderer.params = params;

  // Add bootstrap class for a markdown table
  // See the marked documentation for more details
  renderer.table = (header, body) => `${"<table class='table table-striped table-bordered'>\n<thead>\n"}${header}</thead>\n<tbody>\n${body}</tbody>\n</table>\n`;


  // Add support for nofollow link with the following markdown syntax :
  // [ancho](nofollow:url)
  renderer.link = function link(href, title, text) {
    let relAttribute = "";
    let hrefModified = href;

    // Check if href contains nofollow prefix
    if (hrefModified.indexOf("nofollow:") === 0) {
      hrefModified = hrefModified.substring(9);
      relAttribute = "rel=nofollow";
    }

    if (this.options.sanitize) {
      let prot;
      try {
        prot = decodeURIComponent(unescape(hrefModified))
          .replace(/[^\w:]/g, "")
          .toLowerCase();
      } catch (e) {
        return "";
      }
      /* eslint-disable no-script-url */
      if (prot.indexOf("javascript:") === 0) {
        return "";
      }
    }

    let out = `<a ${relAttribute} href="${hrefModified}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += `>${text}</a>`;
    return out;
  };

  // Render a code section/tag into widget or usual output for code
  // See the marked documentation for more details
  renderer.code = function code(c, lang) {
    if (lang && lang === "widget") {
      // log.debug(code);
      return this.renderWidget(c);
    }
    return this.renderCode(c, lang, true);
  };

  /**
   * Render a widget
   * The code inserted in the markdown content has to be in the json format
   *
   * @param  {json} widgetCode the json code that contains widget params
   * @return {type} the HTML code that match to the widget rendering
   */
  renderer.renderWidget = function renderWidget(widgetCode) {
    try {
      const widget = JSON.parse(widgetCode);
      return widgetRenderer.renderHTML(this.params, widget);
    } catch (e) {
      const errorMessage = `Impossible to parse the json structure for the widget content : ${widgetCode} - error : ${e}`;
      log.error(errorMessage);
      return "widget error\n";
    }
  };


  // Render a code snippet
  // See the marked documentation for more details
  renderer.renderCode = function renderCode(c, lang, e) {
    let code = c;
    let escaped = e;
    if (this.options.highlight) {
      const out = this.options.highlight(code, lang);
      if (out !== null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      return `<pre><code>${escaped ? code : escape(code, true)}\n</code></pre>`;
    }

    return `<pre><code class="${this.options.langPrefix}
            ${escape(lang, true)}">
            ${escaped ? code : escape(code, true)}\n</code></pre>\n`;
  };

  return renderer;
}


module.exports.renderToHTML = renderToHTML;
