[![Build Status](https://travis-ci.org/thanhson1085/swagger-combined.svg)](https://travis-ci.org/thanhson1085/swagger-combined)

[![NPM](https://nodei.co/npm/swagger-combined.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/swagger-combined/)

If you are building a microservice system and using Swagger. 

This packet is able to help you combine all swagger documents to only one document.

For example, you have the swagger documents at `http://service1/docs`, `http://service2/docs`

This will help you combine all links above to only one link `http://service/docs`

**NOTE: If you need Gulp, ES6 and somethings more, please see branch [added_gulp](https://github.com/thanhson1085/swagger-combined/tree/added_gulp)**

### Installation & Run from Docker
```
docker run -d -p 3000:3000 thanhson1085/swagger-combined
```

### Configuration file
See config/default.json as below:
```
{
    "list_url": [
        {
            "docs": "http://petstore.swagger.io/v2/swagger.json",
            "base_path": "http://petstore.swagger.io/v2",
            "route_match": ["/user*", "/pet*", "/store*"]
        }
    ],
    "info": { "title": "Example API", "version": "1.0" },
    "port": 3000
}
```
- docs: swagger document links
- base_path: Proxy Target
- route_match: Routes for proxy

Please make note that you changed `config/default.json` to match all swagger document links you have

### Installation & Run from Source Code
```
git clone https://github.com/thanhson1085/swagger-combined.git
```
Run:
```
cd swagger-combined
npm install
node index.js
```

### Test
In the default, swagger-combined run on port 3000 and included swagger-ui. So you just run `http://localhost:3000?url=http://localhost:3000/docs` to see everything you need. Or you can see swagger api at `http://localhost:3000/docs`

### Example & Demo
With config/default.json:
```
{
    "list_url": [
        {
            "docs": "http://petstore.swagger.io/v2/swagger.json",
            "base_path": "http://petstore.swagger.io/v2",
            "route_match": ["/user*", "/pet*", "/store*"]
        },
        {
            "docs": "https://angular-admin-seed.sonnguyen.ws/docs",
            "base_path": "https://angular-admin-seed.sonnguyen.ws",
            "route_match": ["/api/v1*"]
        }
    ],
    "info": { "title": "Example API", "version": "1.0" },
    "port": 3000
}
```

### License (MIT)
Copyright (c) 2015 Nguyen Sy Thanh Son <thanhson1085@gmail.com>
