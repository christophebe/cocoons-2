const should = require("chai").should();
const p = require("util");
const readdir = p.promisify(require("fs").readdir);
const rimraf = p.promisify(require("rimraf"));
const create = require("../lib/exec/create.js");

const TEST_SITE_FOLDER_1 = `${process.cwd()}/test/test-new-site`;
const TEST_SITE_FOLDER_2 = `${process.cwd()}/test/test-new-site-2`;
const FILES_TO_CHECK = ["public", "src", "templates", "cocoons.json", "package.json", "run.sh", "widgets", "pm2.sh"];
const FILE_TO_EXCLUDE = ".DS_Store";

const check = files => Promise.resolve(FILES_TO_CHECK.length === files.filter(e => e !== FILE_TO_EXCLUDE).length);

describe("Test Create Site", () => {
  after(() => rimraf(TEST_SITE_FOLDER_1));

  it("should return an error because the site template does not exist", () => {
    const siteTemplateName = "xxxx";

    return create.createSite(siteTemplateName, TEST_SITE_FOLDER_2)
      .then(() => should.fail("Exception not thrown"))
      .catch(error => error.should.not.be.null);
  });

  it("should create a nice new site in a target folder based on the default template site", () => {
    const siteTemplateName = "";

    return create.createSite(siteTemplateName, TEST_SITE_FOLDER_1)
      .then(() => readdir(TEST_SITE_FOLDER_1))
      .then(files => check(files))
      .then(diff => diff.should.be.true)
      .catch(error => error.should.be.undefined);
  });
});
