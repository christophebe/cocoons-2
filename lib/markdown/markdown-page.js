const p        = require("util");
const readFile = p.promisify(require("fs").readFile);
const log      = require("../logger.js").Logger;
const util     = require("../util.js");

/**
 *  Read a markdown file & its associated json file.
 *  the md file contains the content.
 *  The json file contains the page properties.
 *  It could the title & the description or specific application properties.
 *
 *
 *  @param the path of the markdown file
 *
 *  the function return Promise with a object page that contains the content & the page properties :
 *
 *  var page = {
 *    properties, // all attributes found in the .json property file
 *    content     // The content in the markdown format
 *  };
 *
 */

async function readPage(file) {

  const [content, properties] = await Promise.all([readMarkdownFile(file),readJsonFile(file)]);
  return {content, properties, file};

}

async function readMarkdownFile(file) {
  try {
    return await readFile(file, "utf-8");
  }
  catch(error) {
    log.error("Impossible to read the markdown file : " + file + " - error : " + error);
    throw(new Error("Impossible to read the markdown file : " + file + " - error : " + error));
  }
}

async function readJsonFile(file) {
  const propsFile = file.replace(".md", ".json");
  try {
    return await util.readJsonFile(propsFile);
  }
  catch(error) {
    log.warn("Impossible to read the property file for markdown content : " + propsFile + " - error : " + error );
    return {};
  }

}

module.exports.readPage = readPage;
