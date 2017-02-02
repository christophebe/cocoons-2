var _				    = require("underscore");
var express     = require('express');
//var bodyParser  = require('body-parser');
var serveStatic = require('serve-static');
var favicon     = require('serve-favicon');
var log         = require('../logger').Logger;
var util 			  = require("../util");
var val					= require("../default").val;

const DEFAULT_PREVIEW_ENGINE = val.siteEngine;
const CONFIG_FILE = val.configFile;

/**
* Public method of this component.
* Run a web site from specific folder
* This folder should contain all the artifacts (content, markdown, images, templates, widgets, ...)
*
* @param the website folder
*/
function start(websiteFolder) {

	readConfigFile(websiteFolder, function (error, config) {
			if (error) {
					log.error("Impossible to start cocoons.io server : " + error);
					return;
			}

			log.info("Start cocoons.io from the directory : " + config.dirname);

			//------------------------------------------------------
			// Create the site engine
			//------------------------------------------------------
			var engine = require(config.siteEngine);
			var preview = new engine.Preview(config);

			//------------------------------------------------------
			// Init & start Express
			//------------------------------------------------------
			var app = express();

			if (config.useProxy) {
				log.info("This cocoons.io server is configured to be used with a reverse proxy");
				app.enable('trust proxy');
			}


			app.use(favicon(config.dirname + "/" + config.public + "/" + config.favicon));
			//app.use(bodyParser());
			/*app.use(bodyParser.json());
			app.use(bodyParser.urlencoded({
			  extended: true
			}));
			*/

			app.use(serveStatic(config.dirname + "/" + config.public));
			log.info("Cocoons public folder for static files : " + config.dirname + "/" + config.public);


			log.info("Template Engine : " + config.templateEngine + " - Template folder : " + config.dirname + "/" + config.templateFolder);
			app.set('views', config.dirname + "/" + config.templateFolder);
			app.set('view engine', config.templateEngine);

			//------------------------------------------------------
			// All requests are dispatching to the site engine
			//------------------------------------------------------
			app.get("/*",  function(req, res) {
				preview.get(req, res);
			});

			if (config.hostname) {
				log.info('Cocoons.io is running on hostname ' + config.hostname + ' and on port ' + config.port);
				app.listen(config.port, config.hostname);
			}
			else {
				log.info('Cocoons.io is running on localhost on port : ' + config.port);
				app.listen(config.port);
			}




	});

}

/**
 * Read the cocoons.json config file from the website folder
 *
 * @param the folder in which the site has been created
 *				If not defined, use the current folder
 * @param callback(error, config)
 */
function readConfigFile(websiteFolder, callback) {

		if (! websiteFolder) {
			websiteFolder = process.cwd();
		}
		else {
			websiteFolder = process.cwd() + "/" + websiteFolder;
		}
		var configFile = websiteFolder + "/" +CONFIG_FILE;

		util.readJsonFile(configFile, function(error, config){
			if (! error) {
					config.dirname = websiteFolder;
			}
			config = _.defaults(config, val);
			callback(error, config);

		});

}


// Export in order to use Cocoons.io as an exectuable (npm global)
exports.start = start;
