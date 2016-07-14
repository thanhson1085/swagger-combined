'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genDocs = exports.info = exports.listUrl = undefined;

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// list all swagger document urls
var listUrl = _config2.default.get('list_url');
var info = _config2.default.get('info');

var transferableFields = ['paths', 'definitions', 'parameters', 'responses', 'securityDefinitions', 'security', 'tags', 'externalDocs'];

var checkConfig = function checkConfig() {
  return new Promise(function (resolve, reject) {
    if (listUrl && info && _underscore2.default.every(listUrl, function (url) {
      return url.docs && url.base_path && url.route_match && url.route_filter;
    })) resolve();else reject('config is not set up correctly');
  });
};

// get swagger json data from urls
var getApiHttp = function getApiHttp(url, resolve, reject) {
  (0, _request2.default)(url, function (err, response, body) {
    if (err) reject(err);else if (response.statusCode !== 200) reject(response.statusCode + ': ' + body);else {
      body = JSON.parse(body);
      resolve(body);
    }
  });
};

// get swagger json data from file
var getApiFile = function getApiFile(path, resolve, reject) {
  _fs2.default.readFile(path, 'utf8', function (err, js) {
    if (err) reject(err);else resolve(JSON.parse(js));
  });
};

var getApi = function getApi(url) {
  return new Promise(function (resolve, reject) {
    if (url.substring(0, 7).toUpperCase() === 'FILE://') getApiFile(url.substring(7), resolve, reject);else getApiHttp(url, resolve, reject);
  });
};

var genDocs = function genDocs(schemes, suppre) {
  return checkConfig().then(function () {
    if (_config2.default.has('schemes')) schemes = _config2.default.get('schemes');else if (!schemes) schemes = ['http'];
    return Promise.all(_underscore2.default.map(listUrl, function (url) {
      return getApi(url.docs).then(function (data) {
        var routeFilterRegex = _underscore2.default.map(url.route_filter, function (rf) {
          return new RegExp(rf);
        });
        var filteredKeys = _underscore2.default.filter(Object.keys(data.paths), function (key) {
          return _underscore2.default.every(routeFilterRegex, function (rgx) {
            return !key.match(rgx);
          });
        });
        var filtered = {};
        _underscore2.default.each(filteredKeys, function (key) {
          return filtered[key] = data.paths[key];
        });
        data.paths = filtered;
        return data;
      });
    })).then(function (all) {
      return _underscore2.default.reduce(all, function (acc, n) {
        _underscore2.default.each(transferableFields, function (key) {
          if (!acc[key] && n[key]) acc[key] = {};
          _underscore2.default.extend(acc[key], n[key]);
        });
        return acc;
      }, {
        swagger: '2.0',
        info: info,
        host: null,
        basePath: null,
        schemes: schemes,
        consumes: null,
        produces: null
      });
    });
  });
};

exports.listUrl = listUrl;
exports.info = info;
exports.genDocs = genDocs;