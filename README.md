[![Build Status](https://travis-ci.org/thanhson1085/swagger-combined.svg)](https://travis-ci.org/thanhson1085/angular-admin-seed)

[![Package Quality](http://npm.packagequality.com/badge/swagger-combined.png)](http://packagequality.com/#?package=swagger-combined)

[![NPM](https://nodei.co/npm/swagger-combined.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/swagger-combined/)

If you are building a microservice system and using Swagger. 

This packet is able to help you combine all swagger documents to only one document.

For example, you have the swagger documents at http://service1/docs, http://service2/docs

This will help you combine all links above to only one link http://service/docs

### Installation & Run
```
npm install swagger-combined
cp -R node_modules/swagger-combined/config .
// change config/default.json
node node_modules/swagger-combined/app.js
```
