#!/usr/bin/env node
const create = require("../lib/exec/create");
const run = require("../lib/exec/run");
const install = require("../lib/exec/install");
const generate = require("../lib/exec/generate");


/**
 * Global application (command line) used to  :
 * - create    : create a new empty site,
 * - preview   : preview the site on localhost
 *
 */
if (process.argv.length < 3) {
  console.log("Usage: cocoons [create|run|install|generate]\n");
  return;
}

let siteTemplateName;
let projectFolder = ".";

switch (process.argv[2]) {
case "create":
  if (process.argv.length === 4) {
    siteTemplateName = process.argv[3];
  }
  create.createSite(siteTemplateName)
    .then(() => console.log("The site is correctly created"))
    .catch(error => `Error during the creation of the site : ${error} `);

  break;

case "run":

  if (process.argv.length === 4) {
    projectFolder = process.argv[3];
  }
  run.start(projectFolder);
  break;

// install = expiremental feature. Normally installing middelwares with npm should be suffisiant
case "install":
  if (process.argv.length !== 4) {
    console.log("Usage : cocoons install middelware-name");
  } else {
    install.installMiddelware(process.argv[3])
      .then(() => console.log(`The middelware ${process.argv[3]} is correctly installed`))
      .catch(error => `Error during the installation of the middelware : ${error}`);
  }

  break;

case "generate":

  if (process.argv.length === 4) {
    projectFolder = process.argv[3];
  }
  generate.generateSite(projectFolder)
    .then(targetFolder => console.log(`The site is correctly generated in ${targetFolder}`))
    .catch(error => `Error during the generation of the site : ${error}`);

  break;

default:
  console.log("Invalid command, use : cocoons [create|run|install]");
  break;
}
