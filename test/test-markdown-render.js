const should = require("chai").should();
const renderer = require("../lib/markdown/bootstrap-markdown-render.js");


describe("Test markdown render", () => {
  it("should create an html code base on the md content", () => {
    const result = renderer.renderToHTML(null, "Hello Nodejs Fan!");
    result.should.equal("<p>Hello Nodejs Fan!</p>\n");

    const result2 = renderer.renderToHTML(null, "# Title \nHello Nodejs Fan!");
    result2.should.equal("<h1 id=\"title\">Title</h1>\n<p>Hello Nodejs Fan!</p>\n");
  });
});
