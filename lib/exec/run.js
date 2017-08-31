const _ = require("underscore");
const express = require("express");
const helmet = require("helmet");
const serveStatic = require("serve-static");
const favicon = require("serve-favicon");
const log = require("../logger").Logger;
const util = require("../util");
const defaults = require("../default").val;

const CONFIG_FILE = defaults.configFile;
const MIDDELWARE_FOLDER = `${process.cwd()}/node_modules`;


/**
 * start - Start the server from a specific folder
 *
 * @param  {type} websiteFolder description
 * @return {undefined}
 */
async function start(websiteFolder) {
  try {
    const config = _.defaults(await util.readJsonFile(`${websiteFolder}/${CONFIG_FILE}`), defaults);
    config.dirname = websiteFolder;
    startServer(config);
  } catch (error) {
    log.error(`Impossible to start cocoons.io server : ${error}`);
  }
}


/**
 * startServer - Run express with a specific config
 *
 * @param  {JSON} config the config (matching to the cocoons.json file)
 * @return {undefined}
 */
function startServer(config) {
  log.info(`Start cocoons.io from the directory : ${config.dirname}`);

  //------------------------------------------------------
  // Init & start Express
  //------------------------------------------------------
  const app = express();
  app.config = config;

  if (config.useProxy) {
    log.info("This cocoons.io server is configured to be used with a reverse proxy");
    app.enable("trust proxy");
  }

  app.use(helmet());
  app.use(favicon(`${config.dirname}/${config.public}/${config.favicon}`));

  app.use(serveStatic(`${config.dirname}/${config.public}`));
  log.info(`Cocoons public folder for static files : ${config.dirname}/${config.public}`);

  log.info(`Template Engine : ${config.templateEngine} - Template folder : ${config.dirname}/${config.templateFolder}`);
  app.set("views", `${config.dirname}/${config.templateFolder}`);
  app.set("view engine", config.templateEngine);

  if (config.hostname) {
    log.info(`Cocoons.io is running on hostname : ${config.hostname} and on port : ${config.port}`);
    app.listen(config.port, config.hostname);
  } else {
    log.info(`Cocoons.io is running on localhost on port : ${config.port}`);
    app.listen(config.port);
  }

  //------------------------------------------------------
  // Load middelwares
  //------------------------------------------------------
  // Need to review this implementation with a more robust module management
  log.info(`Search for middelwares in the folder : ${MIDDELWARE_FOLDER}`);
  config.middelwares.forEach((m) => {
    log.info(`Load middelware : ${m}`);
    const fn = require(`${MIDDELWARE_FOLDER}/${m}`);
    app.use(fn(log));
  });

  //------------------------------------------------------
  // All requests are dispatching to the site engine
  //------------------------------------------------------
  // Need to review this implementation with a more robust module management
  const engine = require(config.siteEngine);
  log.info(`Site engine : ${config.siteEngine}`);
  engine.init(app, config);
  app.get("/*", (req, res) => engine.get(req, res));
}


module.exports.start = start;
