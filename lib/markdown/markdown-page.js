const p = require("util");
const readFile = p.promisify(require("fs").readFile);
const log = require("../logger.js").Logger;
const util = require("../util.js");

/**
 * readPage -  Read a markdown file & its associated json file :
 *  - the md file contains the content.
 *  - the json file contains the page properties.

 * @param  {String} file the path of the markdown file
 * @return {Promise.Object} Promise with a object page that contains the content & the page properties :
 *
 *  var page = {
 *    properties, // all attributes found in the .json property file
 *    content     // The content in the markdown format
 *  };
 */
async function readPage(file) {
  const [content, properties] = await Promise.all([readMarkdownFile(file), readJsonFile(file)]);
  return { content, properties };
}


/**
 * readMarkdownFile - Read the file which content the markdown content
 *
 * @param  {type} file the path of the file
 * @return {Promise.String} the content of the file
 */
async function readMarkdownFile(file) {
  try {
    return await readFile(file, "utf-8");
  } catch (error) {
    log.error(`Impossible to read the markdown file : ${file} - error : ${error}`);
    throw (new Error(`Impossible to read the markdown file : ${file} - error : ${error}`));
  }
}


/**
 * readJsonFile - Read the property file
 *
 * @param  {type} file the path of the file
 * @return {Promise.Object} the json matching to the properties 
 */
async function readJsonFile(file) {
  const propsFile = file.replace(".md", ".json");
  try {
    return await util.readJsonFile(propsFile);
  } catch (error) {
    log.warn(`Impossible to read the property file for markdown content : ${propsFile} - error : ${error}`);
    return {};
  }
}

module.exports.readPage = readPage;
