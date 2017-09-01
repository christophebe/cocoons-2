
const p = require("util");
const readFile = p.promisify(require("fs").readFile);
const readdir = p.promisify(require("fs").readdir);
const readJson = p.promisify(require("jsonfile").readFile);
const path = require("path");
const pug = require("pug");
const log = require("./logger.js").Logger;

const MD_EXTENSION = ".md";
const JSON_EXTENSION = ".json";
const HTML_EXTENSION = ".html";
const PUG_EXTENSION = ".pug";

const isPugFile = file => path.extname(file) === PUG_EXTENSION;
const isHTMLFile = file => path.extname(file) === HTML_EXTENSION;
const isMarkdownFile = file => path.extname(file) === MD_EXTENSION;
const isJsonFile = file => path.extname(file) === JSON_EXTENSION;
const readJsonFile = jsonPath => readJson(jsonPath);
const compilePug = async pugFile => pug.compile(await readFile(pugFile, "utf8"));

/*
const readDir = (dir) => {

    return readdir(dir)
           .then(files => files)
           .;
};
*/

/**
 * readDir - description
 *
 * @param  {type} dir description
 * @return {type}     description
 */
async function readDir(dir) {
  try {
    return await readdir(dir);
  } catch (e) {
    return [];
  }
}

const convertToJson = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    log.error(`Impossible to parse the json String - error : ${e}`);
    return null;
  }
};


module.exports.readJsonFile = readJsonFile;
module.exports.readDir = readDir;
module.exports.convertToJson = convertToJson;
module.exports.compilePug = compilePug;
module.exports.isMarkdownFile = isMarkdownFile;
module.exports.isJsonFile = isJsonFile;
module.exports.isHTMLFile = isHTMLFile;
module.exports.isPugFile = isPugFile;

module.exports.MD_EXTENSION = MD_EXTENSION;
module.exports.JSON_EXTENSION = JSON_EXTENSION;
module.exports.HTML_EXTENSION = HTML_EXTENSION;
module.exports.PUG_EXTENSION = PUG_EXTENSION;
