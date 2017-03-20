const assert = require("assert");
const should = require('chai').should();
const _      = require("underscore");
const blue   = require('bluebird');
const fs     = blue.promisifyAll(require("fs"));
const rimraf = require("rimraf");
const create = require('../lib/exec/create.js');

const TEST_SITE_FOLDER_1 = process.cwd() + "/test/test-new-site";
const TEST_SITE_FOLDER_2 = process.cwd() + "/test/test-new-site-2";
const FILES_TO_CHECK = ["public", "src", "templates", "cocoons.json", "preview.sh", "widgets"];
const FILES_TO_IGNORE = [".DS_Store", "logs"];


describe('Test Create Site', function() {


    after(function(done) {
          rimraf(TEST_SITE_FOLDER_1, function(error){
              done(error);
          });

    });

    it('should return an error because the site template does not exist', function(done) {

        const siteTemplateName = "xxxx";

        create.createSite(siteTemplateName, TEST_SITE_FOLDER_2)
          .then(() => done(new Error("This test didn't generate an error")))
          .catch((error) => done());
    });

    it('should create a nice new site in a target folder based on the default template site', function(done) {

        const siteTemplateName = "";

        create.createSite(siteTemplateName, TEST_SITE_FOLDER_1)
          .then(() => checkSiteDirectories(done))
          .catch((error) => done(error));

    });
});


function checkSiteDirectories(done) {
    fs.readdirAsync(TEST_SITE_FOLDER_1)
      .then((files) => check(files, done))
      .catch((error) => done());
}

function check(files){
  const diff = _.difference(_.difference(files, FILES_TO_IGNORE), FILES_TO_CHECK);
  assert(diff && diff.length === 0, "The site is not correctly created : directories are missing or invalid");

}
