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
