const should   = require("chai").should();
const renderer = require("../lib/markdown/bootstrap-markdown-render.js");


describe("Test markdown render", function() {


  it("should create an html code base on the md content", function() {

    const result = renderer.renderToHTML("Hello Nodejs Fan!");
    //result.be.not.null;
    result.should.equal("<p>Hello Nodejs Fan!</p>\n");


    const result2 = renderer.renderToHTML("# Title \nHello Nodejs Fan!");
    result2.should.equal('<h1 id="title">Title</h1>\n<p>Hello Nodejs Fan!</p>\n');

  });


});
