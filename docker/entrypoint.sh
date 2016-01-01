#!/bin/bash
cd /build
pm2 start -x --no-daemon app.js
