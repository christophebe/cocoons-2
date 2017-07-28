var npm = require('npm');
var resolve = require('resolve');

async function installMiddelware(moduleName) {
  console.log("Installing the middelware : " moduleName);
  npm.load(function(err) {
    // handle errors

    // install module ffi
    npm.commands.install(['ffi'], function(er, data) {
      // log errors or data
    });

    npm.on('log', function(message) {
      // log installation progress
      console.log(message);
    });
  });

}

async function unInstallMiddelware(moduleName) {
  console.log("Uninstalling the middelware : " moduleName);

  var path = resolve.sync(moduleName);

  if (require.cache[path]){
      delete require.cache[path];
  }

}


exports.installMiddelware = installMiddelware;
exports.unInstallMiddelware = unInstallMiddelware;
