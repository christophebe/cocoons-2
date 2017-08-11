const p = require("util");
const install = p.promisify(require("enpeem").install);
const update = p.promisify(require("enpeem").update);


/**
 * installMiddelware - Install a new middelware from the npm repository
 *
 * @param  {String} moduleName the module name to install
 * @return {Promise} The status of the operation
 */
async function installMiddelware(moduleName) {
  console.log(`Installing the middelware : ${moduleName}`);
  const params = {
    // dir: "~/nodejs/_MODULES/cocoons/test/node_modules",
    save: true,
    dependencies: [moduleName],
    // "loglevel": "silent",
    "cache-min": 999999999,
  };

  return install(params);
}


/**
 * updateMiddelwares - Update all middelwares
 *
 * @return {Promise} The status of the operation
 */
async function updateMiddelwares() {
  console.log("Update the middelwares ");
  try {
    await update({ loglevel: "silent" });
  } catch (error) {
    console.log(error);
  }
}


/**
 * unInstallMiddelware - Uninstall a middelware
 *
 * @param  {String} moduleName The name of the module to uninstall
 * @return {Promise} The status of the operation
 */
function unInstallMiddelware(moduleName) {
  console.log(`Uninstalling the middelware : ${moduleName} - not yet implemented`);
}

exports.installMiddelware = installMiddelware;
exports.updateMiddelwares = updateMiddelwares;
exports.unInstallMiddelware = unInstallMiddelware;
