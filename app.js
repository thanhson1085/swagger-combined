var config = require('config');
var httpProxy = require('http-proxy');
var request = require('request');
var q = require('q');
var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
var url = require('url');
var fs = require('fs');
var _ = require("underscore");

// cross origin
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// list all swagger document urls
var listUrl = config.get("list_url");

// general info of your application
var info = config.get("info");
var transferableFields = ["paths", "definitions", "parameters", "responses", "securityDefinitions", "security", "tags", "externalDocs"];
app.get('/docs', function (req, res) {
    var schemes = [req.protocol];
    if (config.has('schemes')) {
        schemes = config.get('schemes');
    }
    q.all(_.map(listUrl, function(url) {
        return getApi(url.docs).then(function(data) {
            var route_filter_regex = _.map(url.route_filter, function(rf) { return new RegExp(rf); });
            var filteredKeys = _.filter(Object.keys(data.paths), function(key) {
                return _.every(route_filter_regex, function(rgx) {
                    return !key.match(rgx);
                });
            });
            var filtered = {};
            _.each(filteredKeys, function(key) { filtered[key] = data.paths[key]; });
            data.paths = filtered;
            return data;
        });
    })).then(function(all) {
        var ret = _.reduce(all, function(acc, n) {
            _.each(transferableFields, function(key) {
                if (!acc[key] && n[key]) acc[key] = {};
                _.extend(acc[key], n[key]);
            });
            return acc;
        }, {
            swagger: "2.0",
            info: info,
            host: null,
            basePath: null,
            schemes: schemes,
            consumes: null,
            produces: null
        });
        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(ret));
    });
});
var proxy = httpProxy.createProxyServer();

listUrl.forEach(function (url) {
    url.route_match.forEach(function (r) {
        // GET proxy
        app.get(r, function (req, res) {
            doForward(req, res, url.base_path, proxy);
        });
        // POST proxy
        app.post(r, function (req, res) {
            doForward(req, res, url.base_path, proxy);
        });
        // PUT proxy
        app.put(r, function (req, res) {
            doForward(req, res, url.base_path, proxy);
        });
        // DELETE proxy
        app.delete(r, function (req, res) {
            doForward(req, res, url.base_path, proxy);
        });
        // OPTIONS proxy
        app.options(r, function (req, res) {
            doForward(req, res, url.base_path, proxy);
        });
    });
});

var doForward = function (req, res, baseUrl, p) {
    try {
        console.log('doForward %s', baseUrl);
        if (url.parse(baseUrl).protocol === 'https:') {
            p.web(req, res, {
                target: baseUrl,
                agent: https.globalAgent,
                headers: {
                    host: url.parse(baseUrl).hostname
                }
            });
        } else {
            p.web(req, res, {
                target: baseUrl,
                agent: http.globalAgent,
                headers: {
                    host: url.parse(baseUrl).hostname
                }
            });
        }
    } catch (e) {
        console.log(e);
    }
};


// redirect page
app.use('/', express.static(__dirname + '/template'));

// addon swagger page
app.use('/s', express.static(__dirname + '/node_modules/swagger-ui/dist'));

// Start web server at port 3000
var port = config.get("port");
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Combines swaggers http://%s:%s', host, port);
});

var getApi = function(url) {
    var def = q.defer();
    if (url.substring(0, 7).toUpperCase() === "FILE://") getApiFile(url.substring(7), def);
    else getApiHttp(url, def);
    return def.promise;
};

// get swagger json data from urls
var getApiHttp = function (url, def) {
    console.log("detected url: " + url);
    request(url, function (err, response, body) {
        if (err) def.reject(err);
        else if (response.statusCode != 200) def.reject(response.statusCode + ": " + body);
        else {
            body = JSON.parse(body);
            def.resolve(body);
        }
    });
};

// get swagger json data from file
var getApiFile = function (path, def) {
    console.log("detected filepath: " + path);
    fs.readFile(path, 'utf8', function(err, js) {
        if (err) {
            if (err) def.reject(err);
        } else {
            js = JSON.parse(js);
            def.resolve(js);
        }
    });
};