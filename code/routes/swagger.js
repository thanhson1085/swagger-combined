import config from 'config';
import _ from 'underscore';
import fs from 'fs';
import request from 'request';

// list all swagger document urls
const listUrl = config.get('list_url');
const info = config.get('info');

const transferableFields = ['paths', 'definitions', 'parameters',
                          'responses', 'securityDefinitions',
                          'security', 'tags', 'externalDocs'];

const checkConfig = () => new Promise((resolve, reject) => {
  if (listUrl && info && _.every(listUrl, url => url.docs && url.base_path && url.route_match && url.route_filter)) resolve();
  else reject('config is not set up correctly');
});

// get swagger json data from urls
const getApiHttp = (url, resolve, reject) => {
  request(url, (err, response, body) => {
    if (err) reject(err);
    else if (response.statusCode !== 200) reject(`${response.statusCode}: ${body}`);
    else {
      body = JSON.parse(body);
      resolve(body);
    }
  });
};

// get swagger json data from file
const getApiFile = (path, resolve, reject) => {
  fs.readFile(path, 'utf8', (err, js) => {
    if (err) reject(err);
    else resolve(JSON.parse(js));
  });
};

const getApi = url => new Promise((resolve, reject) => {
  if (url.substring(0, 7).toUpperCase() === 'FILE://') getApiFile(url.substring(7), resolve, reject);
  else getApiHttp(url, resolve, reject);
});

const genDocs = (schemes, suppre) => checkConfig().then(() => {
  if (config.has('schemes')) schemes = config.get('schemes');
  else if (!schemes) schemes = ['http'];
  return Promise.all(_.map(listUrl, url =>
    getApi(url.docs).then(data => {
      const routeFilterRegex = _.map(url.route_filter, rf => new RegExp(rf));
      const filteredKeys = _.filter(Object.keys(data.paths),
        key => _.every(routeFilterRegex, rgx => !key.match(rgx)));
      let filtered = {};
      _.each(filteredKeys, key => filtered[key] = data.paths[key]);
      data.paths = filtered;
      return data;
    })
  )).then(all =>
    _.reduce(all, (acc, n) => {
      _.each(transferableFields, key => {
        if (!acc[key] && n[key]) acc[key] = {};
        _.extend(acc[key], n[key]);
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
    })
  );
});

export {listUrl, info, genDocs};