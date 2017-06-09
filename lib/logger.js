//var winston = require("winston");
var bunyan = require("bunyan");
var fs = require("fs");

var logFolder = process.cwd() + "/logs";
var debugLogFile = logFolder + "/debug.log";

let streams = [{level: "debug",path: debugLogFile}];

if (! process.env.CONSOLE_LOG || process.env.CONSOLE_LOG==='yes' ){
  streams.push({level: "debug", stream: process.stdout});
}

fs.mkdir(logFolder, function(err) {

  if (err && err.code !== "EEXIST") {
    throw err;
  }
});

// Levels : trace, debug, info, warn, error

var Logger = bunyan.createLogger({
  name: "cocoons",
  streams: streams
});

console.log("Cocoons log file " + debugLogFile);


module.exports.Logger = Logger;
