'use strict';

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _httpProxy = require('http-proxy');

var _httpProxy2 = _interopRequireDefault(_httpProxy);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _swagger = require('./swagger');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

// cross origin
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/docs', function (req, res) {
  (0, _swagger.genDocs)([req.protocol]).then(function (docs) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(docs));
  });
});

var doForward = function doForward(req, res, baseUrl, p) {
  try {
    console.log('doForward %s', baseUrl);

    var agent = _url2.default.parse(baseUrl).protocol === 'https:' ? _https2.default.globalAgent : _http2.default.globalAgent;
    p.web(req, res, {
      target: baseUrl,
      agent: agent,
      headers: {
        host: _url2.default.parse(baseUrl).hostname
      }
    });
  } catch (e) {
    console.log(e);
  }
};
var proxy = _httpProxy2.default.createProxyServer();
var verbs = [app.get, app.post, app.put, app.patch, app.delete, app.options];
_underscore2.default.each(_swagger.listUrl, function (url) {
  return _underscore2.default.each(verbs, function (verb) {
    return _underscore2.default.each(url.route_match, function (r) {
      return verb.call(app, r, function (req, res) {
        return doForward(req, res, url.base_path, proxy);
      });
    });
  });
});

// redirect page
app.use('/', _express2.default.static(_path2.default.join(__dirname, '../template')));

// addon swagger page
app.use('/s', _express2.default.static(_path2.default.join(__dirname, '../node_modules/swagger-ui/dist')));

// Start web server at port 3000
var port = _config2.default.get('port');
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('combine swagger files at http://%s:%s', host, port);
});
