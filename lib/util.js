
const p        = require("util");
const readFile = p.promisify(require("fs").readFile);
const readJson = p.promisify(require("jsonfile").readFile);
const path     = require("path");
const pug      = require("pug");
const log      = require("./logger.js").Logger;

const MD_EXTENSION = ".md";
const JSON_EXTENSION = ".json";
const HTML_EXTENSION = ".html";
const PUG_EXTENSION = ".pug";

function isPugFile(file) {
  return path.extname(file) === PUG_EXTENSION;
}

function isHTMLFile(file) {
  return path.extname(file) === HTML_EXTENSION;
}

function isMarkdownFile(file) {
  return path.extname(file) === MD_EXTENSION;
}

function isJsonFile(file) {
  return path.extname(file) === JSON_EXTENSION;
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
  return readJson(jsonPath);
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
  return pug.compile(await readFile(pugFile, "utf8"));

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
