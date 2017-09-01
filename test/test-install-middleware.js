const should = require("chai").should();
const p = require("util");
const readdir = p.promisify(require("fs").readdir);
const rimraf = p.promisify(require("rimraf"));
const install = require("../lib/exec/install.js");

const INSTALL_FOLDER = "./test/install-middleware";
const NODE_MODULES_FOLDER = "node_modules";
const MIDDELWARE_NAME = "cocoons-access";


/**
 * install = expiremental feature. Normally installing middelwares with npm should be suffisiant
 */

const check = files => files.includes(MIDDELWARE_NAME);

describe("Test install middelware ", () => {
  after(() => rimraf(`${INSTALL_FOLDER}/${NODE_MODULES_FOLDER}`));

  it("should install a middelware available on npm site", function testInstall() {
    this.timeout(20000);
    return install.installMiddelware(MIDDELWARE_NAME, INSTALL_FOLDER)
      .then(() => readdir(`${INSTALL_FOLDER}/${NODE_MODULES_FOLDER}`))
      .then(files => check(files))
      .then(checked => checked.should.be.true)
      .catch(error => error.should.be.undefined);
  });
});
