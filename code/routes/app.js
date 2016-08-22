import config from 'config';
import httpProxy from 'http-proxy';
import express from 'express';
import https from 'https';
import http from 'http';
import url from 'url';
import _ from 'underscore';
import {genDocs, listUrl} from './swagger';
import path from 'path';

const app = express();

// cross origin
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/docs', (req, res) => {
  genDocs([req.protocol]).then(docs => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(docs));
  });
});

const doForward = function (req, res, baseUrl, p) {
  try {
    console.log('doForward %s', baseUrl);

    const agent = url.parse(baseUrl).protocol === 'https:' ? https.globalAgent : http.globalAgent;
    p.web(req, res, {
      target: baseUrl,
      agent,
      headers: {
        host: url.parse(baseUrl).hostname
      }
    });
  } catch (e) {
    console.log(e);
  }
};
const proxy = httpProxy.createProxyServer();
const verbs = [app.get, app.post, app.put, app.patch, app.delete, app.options];
_.each(listUrl, url =>
  _.each(verbs, verb =>
    _.each(url.route_match, r =>
      verb.call(app, r, (req, res) => doForward(req, res, url.base_path, proxy))
    )
  )
);

// redirect page
app.use('/', express.static(path.join(__dirname, '../template')));

// addon swagger page
app.use('/s', express.static(path.join(__dirname, '../node_modules/swagger-ui/dist')));

// Start web server at port 3000
const port = config.get('port');
const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('combine swagger files at http://%s:%s', host, port);
});
