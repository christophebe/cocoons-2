const npm = require("npm");

async function installMiddelware(moduleName) {
    console.log("Installing the middelware : " + moduleName);

    npm.load({loaded: true}, function (error) {
      if (error) {
          console.log(error);
      }
      npm.on("log", function (message) {
        // log the progress of the installation
        console.log(message);
      });
      npm.commands.install(["cocoons-access"], function (er, data) {
        // log the error or data
        if(er) {
          console.log(er);
        }
      });


   });
}

function unInstallMiddelware(moduleName) {
  console.log("Uninstalling the middelware : " + moduleName);

  var path = resolve.sync(moduleName);

  if (require.cache[path]){
      delete require.cache[path];
  }

}


exports.installMiddelware = installMiddelware;
exports.unInstallMiddelware = unInstallMiddelware;
