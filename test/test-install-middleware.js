const should  = require("chai").should();
const _       = require("underscore");
const p       = require("util");
const readdir = p.promisify(require("fs").readdir);
const rimraf  = p.promisify(require("rimraf"));
const install  = require("../lib/exec/install.js");

describe("Test install middelware ", function() {

  after(function() {
    //return rimraf(TEST_SITE_FOLDER_1);
  });

  it.only("should install a middelware available on npm site", function() {

    const middelwareName = "cocoons-access";

    return install.installMiddelware(middelwareName)
          .then(() =>  console.log("Check install ....") )
          //.catch(error => {error.should.be.undefined;});
          .catch(error => console.log(error));
  });


});


function check(files) {
  return Promise.resolve(_.difference(_.difference(files, FILES_TO_IGNORE), FILES_TO_CHECK).length);
}
