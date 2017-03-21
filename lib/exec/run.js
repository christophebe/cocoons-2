const _				    = require("underscore");
const express     = require('express');
const helmet      = require('helmet');
const serveStatic = require('serve-static');
const favicon     = require('serve-favicon');
const log         = require('../logger').Logger;
const util 			  = require("../util");
const defaults	  = require("../default").val;

const CONFIG_FILE = defaults.configFile;

/**
* Public method of this component.
* Run a web site from a specific folder
* This folder should contain all the artifacts (content, markdown, images, templates, widgets, ...)
*
* @param the website folder
*/
function start(websiteFolder) {

	readConfigFile(websiteFolder)
		.then(config => preview(config))
		.catch(error => log.error("Impossible to start cocoons.io server : " + error));

}

/**
 * Read the cocoons.json config file from the website folder
 *
 * @param the folder in which the site has been created
 *				If not defined, use the current folder
 * @param callback(error, config)
 */
async function readConfigFile(websiteFolder, callback) {

		if (! websiteFolder) {
			websiteFolder = process.cwd();
		}
		else {
			websiteFolder = process.cwd() + "/" + websiteFolder;
		}
		const configFile = websiteFolder + "/" + CONFIG_FILE;

		return await util.readJsonFile(configFile)
				.then(config => _.defaults(config, defaults));
}

async function preview(config) {
	log.info("Start cocoons.io from the directory : " + config.dirname);

	//------------------------------------------------------
	// Init & start Express
	//------------------------------------------------------
	const app = express();
	app.config = config;

	const engine = require(config.siteEngine);
	log.info("Site engine : " + config.siteEngine);
	engine.init(app, config);


	if (config.useProxy) {
		log.info("This cocoons.io server is configured to be used with a reverse proxy");
		app.enable('trust proxy');
	}

	app.use(helmet());
	app.use(favicon(config.dirname + "/" + config.public + "/" + config.favicon));

	app.use(serveStatic(config.dirname + "/" + config.public));
	log.info("Cocoons public folder for static files : " + config.dirname + "/" + config.public);


	log.info("Template Engine : " + config.templateEngine + " - Template folder : " + config.dirname + "/" + config.templateFolder);
	app.set('views', config.dirname + "/" + config.templateFolder);
	app.set('view engine', config.templateEngine);

	//------------------------------------------------------
	// All requests are dispatching to the site engine
	//------------------------------------------------------

  app.get('/', wrap(async (req, res) => engine.get(req, res))); 

	if (config.hostname) {
		log.info('Cocoons.io is running on hostname ' + config.hostname + ' and on port ' + config.port);
		app.listen(config.port, config.hostname);
	}
	else {
		log.info('Cocoons.io is running on localhost on port : ' + config.port);
		app.listen(config.port);
	}

	//------------------------------------------------------
	// Load middelwares
	//------------------------------------------------------
	config.middelwares.forEach(function(m) {
			log.info("Load middelware : " + m);
			const fn = require(m);
			app.use(fn.middelware);
	});

}

exports.start = start;
