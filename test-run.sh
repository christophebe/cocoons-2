#!/bin/sh
rm -rf ./logs
nodemon bin/exec.js run test/test-run -e js,json,pug  | bunyan -l debug
#node --trace-sync-io bin/exec.js run ./test/test-run
