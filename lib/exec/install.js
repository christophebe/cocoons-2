const p       = require("util");
const install = p.promisify(require("enpeem").install);
const update  = p.promisify(require("enpeem").update);

async function installMiddelware(moduleName) {
  console.log("Installing the middelware : " + moduleName);
  const params = {
    dir: "~/nodejs/_MODULES/cocoons/test/node_modules",
    "save" : true,
    "dependencies": [moduleName],
    //"loglevel": "silent",
    "cache-min": 999999999
  };

  try {
    await install(params);
  } catch (error) {
    console.log(error);
  }


}

async function updateMiddelwares() {
  console.log("Update the middelwares ");
  try {
    await update({loglevel: "silent"});
  } catch (error) {
    console.log(error);
  }


}

function unInstallMiddelware(moduleName) {
  console.log("Uninstalling the middelware : " + moduleName + " - not yet implemented");

}

exports.installMiddelware = installMiddelware;
exports.updateMiddelwares = updateMiddelwares;
exports.unInstallMiddelware = unInstallMiddelware;
