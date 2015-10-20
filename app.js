var config = require('config');
var httpProxy = require('http-proxy');
var request = require('request');
var q = require('q');
var express = require('express');
var app = express();

// cross origin
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// list all swagger document urls
var listUrl = config.get("list_url");

// general infor of your application
var info = config.get("info");
app.get('/docs', function(req, res) {
    getApis(listUrl).then(function(data){
        var ret = data.reduce(function(a, i){
            if (!a) {
                a = i;
            }
            else{
                // combines paths
                for (key in i.paths){
                    a.paths[key] = i.paths[key];
                }
                // combines definitions
                for (key in i.definitions){
                    a.definitions[key] = i.definitions[key];
                }
            }
            return a;
        }, false);
        ret.info = info;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(ret));
    }); 
});
var proxy = httpProxy.createProxyServer();

listUrl.forEach(function(url){
    url.route_match.forEach(function(r){
        // GET proxy
        app.get(r, function(req, res){ 
            proxy.web(req, res, { target: url.base_path });
        });
        // POST proxy
        app.post(r, function(req, res){ 
            proxy.web(req, res, { target: url.base_path });
        });
        // PUT proxy
        app.put(r, function(req, res){ 
            proxy.web(req, res, { target: url.base_path });
        });
        // DELETE proxy
        app.delete(r, function(req, res){ 
            proxy.web(req, res, { target: url.base_path });
        });
        // OPTIONS proxy
        app.options(r, function(req, res){ 
            proxy.web(req, res, { target: url.base_path });
        });
    });
});


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

// get swagger json data from urls
var getApis = function(urls){
    var the_promises = [];
    urls.forEach(function(url){
        var def = q.defer();
        request(url.docs, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                def.resolve(body);
            }
        });
        the_promises.push(def.promise);
    });
    return q.all(the_promises);
}

