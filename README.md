[![Build Status](https://travis-ci.org/thanhson1085/swagger-combined.svg)](https://travis-ci.org/thanhson1085/swagger-combined)

[![NPM](https://nodei.co/npm/swagger-combined.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/swagger-combined/)

If you are building a microservice system and using Swagger. 

This packet is able to help you combine all swagger documents to only one document.

For example, you have the swagger documents at http://service1/docs, http://service2/docs

This will help you combine all links above to only one link http://service/docs

### Installation via NPM
```
npm install swagger-combined
```

**Configuration:**

Create sample configuration file:
```
cp -R node_modules/swagger-combined/config .
```
And see config/default.json as below:
```
{
    "list_url": [
        {
            "docs": "http://petstore.swagger.io/v2/swagger.json",
            "base_path": "http://petstore.swagger.io/",
            "route_match": ["/v2*"]
        }
    ],
    "info": { "title": "Example API", "version": "1.0" },
    "port": 3000
}
```
- docs: swagger document links
- base_path: Proxy Target
- route_match: Routes for proxy

**And run:**

Change config/default.json to match your swagger links
```
node node_modules/swagger-combined/app.js
```
Please make note that you changed config/default.json to match all swagger document links you have

### Installation & Run from Source Code
```
git clone https://github.com/thanhson1085/swagger-combined.git
```

**And run:**
```
cd swagger-combined
node app.js
```

### Test
In the default, swagger-combined run on port 3000 and included swagger-ui. So you just run http://localhost:3000 to see everything you need. Or you can see swagger api at http://localhost:3000/docs

### License (MIT)
Copyright (c) 2015 Nguyen Sy Thanh Son <thanhson1085@gmail.com>
 
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
 
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
