#!/usr/bin/env node
var create   = require('../lib/exec/create.js');
var preview  = require('../lib/exec/preview.js');


/**
 * Global application (command line) used to  :
 * - create    : create a new empty site,
 * - preview   : preview the site on localhost,
 *
 */
if ( process.argv.length < 3 ) {
   console.log('Usage: cocoons [create|preview]\n');
   return;
}

switch (process.argv[2]) {

      case "create":
          var siteTemplateName;

          if (process.argv.length === 4) {
            siteTemplateName = process.argv[3];
          }
          create.createSite(siteTemplateName, null, function(error, status) {
              if (error) {
                console.log("Error during the creation of the site : " + error );
              }
              else {
                console.log("The site is correctly created : " + status);
              }
          });
          break;



      case "preview":
          var projectFolder;

          if (process.argv.length === 4) {
            projectFolder = process.argv[3];
          }
          preview.previewSite(projectFolder);
          break;


      default:
        console.log("Invalid command, use : cocoons [create|preview]");
          break;
}
