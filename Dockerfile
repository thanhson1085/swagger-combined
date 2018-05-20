FROM mhart/alpine-node:8.11.2

WORKDIR /build
COPY ./package.json /build/package.json

RUN npm install

ADD . /build

CMD ["node", "index.js"]
