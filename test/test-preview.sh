#!/bin/sh

nodemon ../bin/exec.js preview ./test-preview/ -e js,json,jade | bunyan -l debug
