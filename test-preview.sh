#!/bin/sh
rm -rf ./logs
nodemon bin/exec.js run test/test-run -e js,json,jade | bunyan -l debug
