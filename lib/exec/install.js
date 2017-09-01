const p = require("util");
const install = p.promisify(require("enpeem").install);
const update = p.promisify(require("enpeem").update);
const log = require("../logger").Logger;

/**
 * install = expiremental feature. Normally installing middelwares with npm should be suffisiant
 */

/**
 * installMiddelware - Install a new middelware from the npm repository
 *
 * @param  {String} moduleName the module name to install
 * @param  {String} folder the parent folder containgin the node_modules folder.
 *                  Default value is the current folder
 * @return {Promise} The status of the operation
 */
async function installMiddelware(moduleName, folder = process.cwd()) {
  log.debug(`Installing the middelware : ${moduleName} in ${folder}`);
  const params = {
    dir: folder,
    save: true,
    dependencies: [moduleName],
    loglevel: "silent",
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
  return update({ loglevel: "silent" });
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
