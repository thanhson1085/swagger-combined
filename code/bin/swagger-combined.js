// import process from 'process';
import _ from 'underscore';
import {genDocs} from '../routes/swagger';

const args = _.toArray(process.argv.slice(2));
if (!_.isEmpty(args)) {
  console.log('combine swagger documentation from config. See default.json for an example config');
  console.log('usage:');
  console.log('node swagger-combined.js');
  process.exit();
}

genDocs().then(docs => console.log(JSON.stringify(docs))).catch(e => console.log(e));
