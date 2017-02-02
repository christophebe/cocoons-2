var assert = require("assert");
var _ = require("underscore");
var fs = require('fs');
var rimraf = require("rimraf");
var create = require('../lib/exec/create.js');

var TEST_SITE_FOLDER_1 = process.cwd() + "/test/test-new-site";
var TEST_SITE_FOLDER_2 = process.cwd() + "/test/test-new-site-2";
var FILES_TO_CHECK = ["public", "src", "templates", "cocoons.json", "preview.sh", "widgets"];
var FILES_TO_IGNORE = [".DS_Store", "logs"];


describe('Test Create Site', function() {


    after(function(done) {
          rimraf(TEST_SITE_FOLDER_1, function(error){
              done(error);
          });

    });

    it('should return an error because the site template does not exist', function(done) {

        var siteTemplateName = "xxxx";

        create.createSite(siteTemplateName, TEST_SITE_FOLDER_2, function(error, status) {
            if (!error) {
                done(new Error("This test didn't generate an error"));
            }
            done();
        });


    });

    it('should create a nice new site in a target folder based on the default template site', function(done) {

        var siteTemplateName = "";

        create.createSite(siteTemplateName, TEST_SITE_FOLDER_1, function(error, status) {
            if (error) {

                done(error);
            } else {

                checkSiteDirectories(done);
            }

        });

    });
});


function checkSiteDirectories(done) {

    fs.readdir(TEST_SITE_FOLDER_1, function(error, files) {

        if (error) {
            done(error);
            return;
        }

        var diff = _.difference(_.difference(files, FILES_TO_IGNORE), FILES_TO_CHECK);

        assert(diff && diff.length === 0, "The site is not correctly created : directories are missing or invalid");
        done();

    });


}
