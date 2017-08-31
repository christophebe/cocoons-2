const bunyan = require("bunyan");
const fs = require("fs");

const logFolder = `${process.cwd()}/logs`;
const debugLogFile = `${logFolder}/debug.log`;

const streams = [{ level: "debug", path: debugLogFile }];

if (!process.env.CONSOLE_LOG || process.env.CONSOLE_LOG === "yes") {
  streams.push({ level: "debug", stream: process.stdout });
}

fs.mkdir(logFolder, (err) => {
  if (err && err.code !== "EEXIST") {
    throw err;
  }
});

// Levels : trace, debug, info, warn, error

const Logger = bunyan.createLogger({
  name: "cocoons",
  streams,
});

console.log(`Cocoons log file ${debugLogFile}`);


module.exports.Logger = Logger;
