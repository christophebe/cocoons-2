var log   = require("../logger").Logger;

function middelware(req, res, next) {
  var logAccess = "[" + req.ip + "] :" + req.url + " - " + req.headers["user-agent"] ;

  if (req.app.config.useProxy) {
    logAccess += "  - ips : " + req.ips;
  }

  log.info(logAccess);
  next();
}

exports.middelware = middelware;
