const should  = require("chai").should();
const _       = require("underscore");
const p       = require("util");
const readdir = p.promisify(require("fs").readdir);
const rimraf  = p.promisify(require("rimraf"));
const create  = require("../lib/exec/create.js");

const TEST_SITE_FOLDER_1 = process.cwd() + "/test/test-new-site";
const TEST_SITE_FOLDER_2 = process.cwd() + "/test/test-new-site-2";
const FILES_TO_CHECK = ["public", "src", "templates", "cocoons.json", "preview.sh", "widgets", "pm2.sh"];
const FILES_TO_IGNORE = [".DS_Store", "logs"];

describe("Test Create Site", function() {

  after(function() {
    return rimraf(TEST_SITE_FOLDER_1);
  });

  it("should return an error because the site template does not exist", function() {

    const siteTemplateName = "xxxx";

    return create.createSite(siteTemplateName, TEST_SITE_FOLDER_2)
          .then(() => should.fail("Exception not thrown"))
          .catch((error) =>  error.should.not.be.null);
  });

  it("should create a nice new site in a target folder based on the default template site", function() {

    const siteTemplateName = "";

    return create.createSite(siteTemplateName, TEST_SITE_FOLDER_1)
          .then(() => readdir(TEST_SITE_FOLDER_1))
          .then(files => check(files))
          .then(diff => diff.should.be.equals(0))
          .catch(error => {error.should.be.undefined;});


  });
});


function check(files) {
  return Promise.resolve(_.difference(_.difference(files, FILES_TO_IGNORE), FILES_TO_CHECK).length);
}
