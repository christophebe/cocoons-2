
const blue     = require("bluebird");
const fs       = blue.promisifyAll(require("fs"));
const jsonfile = blue.promisifyAll(require("jsonfile"));
const pug      = require("pug");
const log      = require("./logger.js").Logger;

const MD_EXTENSION = ".md";
const JSON_EXTENSION = ".json";
const HTML_EXTENSION = ".html";
const PUG_EXTENSION = ".pug";

function isPugFile(path) {
  return path.indexOf(PUG_EXTENSION, this.length - PUG_EXTENSION.length) !== -1;
}

function isHTMLFile(path) {
  return path.indexOf(HTML_EXTENSION, this.length - HTML_EXTENSION.length) !== -1;
}

function isMarkdownFile(path) {
  return path.indexOf(MD_EXTENSION, this.length - MD_EXTENSION.length) !== -1;
}

function isJsonFile(path) {
  return path.indexOf(JSON_EXTENSION, this.length - JSON_EXTENSION.length) !== -1;
}

/**
 * Read a json file asynchronously
 * Support comments in the file
 *
 * @param the json file path
 * @param callback(error, json)
 *
 */
function readJsonFile(jsonPath) {
  return jsonfile.readFileAsync(jsonPath);
}

function convertToJson(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    log.error("Impossible to parse the json String - error : " + e);
    return null;
  }
}

async function compilePug(pugFile) {
  return pug.compile(await fs.readFileAsync(pugFile, "utf8"));

}

module.exports.readJsonFile = readJsonFile;
module.exports.convertToJson = convertToJson;
module.exports.isMarkdownFile = isMarkdownFile;
module.exports.compilePug = compilePug;
module.exports.isJsonFile = isJsonFile;
module.exports.isHTMLFile = isHTMLFile;
module.exports.isPugFile = isPugFile;

module.exports.MD_EXTENSION = MD_EXTENSION;
module.exports.JSON_EXTENSION = JSON_EXTENSION;
module.exports.HTML_EXTENSION = HTML_EXTENSION;
module.exports.PUG_EXTENSION = PUG_EXTENSION;
