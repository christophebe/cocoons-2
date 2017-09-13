
const p = require("util");
const fs = require("fs");

const readFile = p.promisify(fs.readFile);
const readdir = p.promisify(fs.readdir);
const writefile = p.promisify(fs.writeFile);
const mkdir = p.promisify(fs.mkdir);
const stat = p.promisify(fs.stat);
const readJson = p.promisify(require("jsonfile").readFile);
const rimraf = p.promisify(require("rimraf"));
const pugRenderFile = p.promisify(require("pug").renderFile);
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
const renderFile = (template, params) => pugRenderFile(template, params);
const writeFile = (filePath, content) => writefile(filePath, content);
const statFile = filePath => stat(filePath);
const copyFile = (from, to) => Promise.resolve(fs.createReadStream(from).pipe(fs.createWriteStream(to)));
const mkDir = dirPath => mkdir(dirPath);
/**
 * readDir - get the list of all files/subdir for a directory
 *
 * @param  {String} dir the path of the directory
 * @return {Array<String>} the list of the files & subdir
 */
async function readDir(dir) {
  try {
    return await readdir(dir);
  } catch (e) {
    return [];
  }
}

const removeAndCreateDirectory = async (dir) => { await rimraf(dir); return mkdir(dir); };

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
module.exports.mkDir = mkDir;
module.exports.writeFile = writeFile;
module.exports.copyFile = copyFile;
module.exports.stat = statFile;
module.exports.removeAndCreateDirectory = removeAndCreateDirectory;
module.exports.convertToJson = convertToJson;
module.exports.compilePug = compilePug;
module.exports.renderFile = renderFile;
module.exports.isMarkdownFile = isMarkdownFile;
module.exports.isJsonFile = isJsonFile;
module.exports.isHTMLFile = isHTMLFile;
module.exports.isPugFile = isPugFile;

module.exports.MD_EXTENSION = MD_EXTENSION;
module.exports.JSON_EXTENSION = JSON_EXTENSION;
module.exports.HTML_EXTENSION = HTML_EXTENSION;
module.exports.PUG_EXTENSION = PUG_EXTENSION;
