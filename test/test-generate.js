const should = require("chai").should();
const p = require("util");
const readdir = p.promisify(require("fs").readdir);
const rimraf = p.promisify(require("rimraf"));
const generate = require("../lib/exec/generate.js");

const TEST_SITE_FOLDER = `${process.cwd()}/test/test-run`;

const FILES_TO_CHECK = ["404.html", "500.html", "all-widgets.html", "bad-folder.html", "carousel.html", "cloaking",
  "css", "fonts", "images", "index.html", "js", "markdown-2.html", "markdown.html", "static-file.html", "video"];

const FILE_TO_EXCLUDE = [".DS_Store"];


const check = files => Promise.resolve(FILES_TO_CHECK.length === files.filter(e => e !== FILE_TO_EXCLUDE).length);

describe("Test Create Site", () => {
  after(() => rimraf(`${TEST_SITE_FOLDER}/target`));


  it("should generate a nice static site website in a target folder based on the default template site", () =>

    /*
    return create.createSite(siteTemplateName, TEST_SITE_FOLDER_1)
      .then(() => readdir(TEST_SITE_FOLDER_1))
      .then(files => check(files))
      .then(diff => diff.should.be.true)
      .catch(error => error.should.be.undefined);
    */
    generate.generateSite(TEST_SITE_FOLDER)
      .catch(error => console.log(error))
      .then(() => readdir(`${TEST_SITE_FOLDER}/target`))
      .then((files => check(files)))
      .catch(error => error.should.be.undefined),
  );
});
