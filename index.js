var config = require('config');
var httpProxy = require('http-proxy');
var request = require('request');
var q = require('q');
var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
var url = require('url');
var cache = require('memory-cache');

// cross origin
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// list all swagger document urls
var listUrl = config.get("list_url");
console.log("list_url=%j", listUrl);
var timeout = config.has("timeout") ? config.get ("timeout") : 5000;
var ttl = config.has("ttl") ? config.get("ttl") : 60000;

// general infor of your application
var info = config.get("info");
app.get('/docs', function(req, res) {
    var schemes = [ req.protocol ];
    if (config.has('schemes')) {
        schemes = config.get('schemes', false);
    }
    getApis(listUrl).then(function(data){
        var ret = data.reduce(function(a, i){
            if (!a) {
                a = Object.assign({}, i);
                a.paths = {};
                a.definitions = {};
            }
            // combines paths
            for (var key in i.paths){
                a.paths[i.basePath + key] = i.paths[key];
            }
            // combines definitions
            for (var k in i.definitions){
                a.definitions[k] = i.definitions[k];
            }
            return a;
        }, false);
        ret.info = info;
        ret.host = null;
        ret.basePath = null;
        ret.schemes = schemes;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(ret));
    });
});
var proxy = httpProxy.createProxyServer();

listUrl.forEach(function(url){
    url.route_match.forEach(function(r){
        // GET proxy
        app.get(r, function(req, res){
            doForward(req, res, url.base_path, proxy);
        });
        // POST proxy
        app.post(r, function(req, res){
            doForward(req, res, url.base_path, proxy);
        });
        // PUT proxy
        app.put(r, function(req, res){
            doForward(req, res, url.base_path, proxy);
        });
        // PATCH proxy
        app.patch(r, function(req, res){
            doForward(req, res, url.base_path, proxy);
        });
        // DELETE proxy
        app.delete(r, function(req, res){
            doForward(req, res, url.base_path, proxy);
        });
        // OPTIONS proxy
        app.options(r, function(req, res){
            doForward(req, res, url.base_path, proxy);
        });
    });
});

var doForward = function(req, res, baseUrl, p) {
    try {
        console.log('doForward %s', baseUrl);
        console.log('With path', req.path);
        if (url.parse(baseUrl).protocol === 'https:') {
            p.web(req, res, {
                target: baseUrl,
                agent : https.globalAgent ,
                headers: {
                    host: url.parse(baseUrl).hostname
                }
            }, function(e) {
                console.log(e);
                res.status(500).json({});
            });
        } else {
            p.web(req, res, {
                target: baseUrl,
                agent : http.globalAgent ,
                headers: {
                    host: url.parse(baseUrl).hostname
                }
            }, function(e) {
                console.log(e);
                res.status(500).json({});
            });
        }
    } catch (e) {
        console.log(e);
    }
}

// addon swagger page
app.use('/', express.static(__dirname + '/swagger-ui/'));

// Start web server at port 3000
var port = config.get("port");
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Combines swaggers http://%s:%s', host, port);
});

// get swagger json data from urls
var getApis = function(urls){
    var cached = cache.get("services");
    if (cached != null) {
        return Promise.resolve(cached);
    }
    var the_promises = [];
    urls.forEach(function(url){
        var def = q.defer();
        request(url.docs,
            {timeout: timeout},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    body = JSON.parse(body);
                    def.resolve(body);
                } else {
                    console.error("url=%s, error=%j", url.docs, error);
                    def.reject(error);
                }
        });
        the_promises.push(def.promise);
    });
    return q.allSettled(the_promises)
        .then(function (promises) {
            var services = promises
                .filter(function (promise) {
                    return promise.state === "fulfilled";
                })
                .map(function (promise) {
                    return promise.value;
                });

            if (urls.length === services.length) {
                cache.put("services", services, ttl);
            } else {
                console.log("services available %s/%s", services.length, urls.length);
            }
            return services;
        });
};
