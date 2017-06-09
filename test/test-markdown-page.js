const should = require("chai").should();
const md = require("../lib/markdown/markdown-page.js");

const FILE_MD_1 = "./test/md/test.md";
const FILE_MD_2 = "./test/md/test2.md";

describe("Test read markdown page and its property file", function() {


  it("should read an existing md file and its properties ", function() {

    return md.readPage(FILE_MD_1)
        .then(page => {
          page.should.be.not.null;
          page.properties.title.should.equal("this is the title");
          page.content.should.equal("This is the markdown file content \n");})
        .catch(error => error.should.be.undefined);

  });

  it("should return the content without properties for a md file without json", function() {

    return md.readPage(FILE_MD_2)
        .then(page => {
          page.should.be.not.null;
          page.content.should.equal("Test 2\n");})
        .catch(error => error.should.be.undefined);

  });

  it("should return an error when reading an unknown md file ", function() {

    return md.readPage("xxx.md")
        .then(() => should.fail("Exception not thrown"))
        .catch(error => error.should.not.be.null);

  });
});
