'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _swagger = require('../routes/swagger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import process from 'process';


var args = _underscore2.default.toArray(process.argv.slice(2));
if (!_underscore2.default.isEmpty(args)) {
  console.log('combine swagger documentation from config. See default.json for an example config');
  console.log('usage:');
  console.log('node swagger-combined.js');
  process.exit();
}

(0, _swagger.genDocs)().then(function (docs) {
  return console.log(JSON.stringify(docs));
}).catch(function (e) {
  return console.log(e);
});