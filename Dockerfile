FROM ubuntu:14.04
MAINTAINER Nguyen Sy Thanh Son <thanhson1085@gmail.com>

RUN apt-get update && \
    apt-get install -y \
    build-essential wget \
    python-pip python-dev

RUN \
    cd /tmp && \
    wget http://nodejs.org/dist/v4.2.2/node-v4.2.2.tar.gz && \
    tar xvzf node-v4.2.2.tar.gz && \
    rm -f node-v4.2.2.tar.gz && \
    cd node-v* && \
    ./configure && \
    CXX="g++ -Wno-unused-local-typedefs" make && \
    CXX="g++ -Wno-unused-local-typedefs" make install
RUN \
    cd /tmp && \
    rm -rf /tmp/node-v* && \
    npm install -g npm && \
    printf '\n# Node.js\nexport PATH="node_modules/.bin:$PATH"' >> /root/.bashrc

RUN pip install supervisor-stdout

WORKDIR /build
COPY ./package.json /build/package.json

RUN npm install
RUN npm install -g pm2

ADD . /build

# run app
COPY docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
