FROM ubuntu:14.04
MAINTAINER Nguyen Sy Thanh Son <sonnst@sigma-solutions.eu>

RUN apt-get update && \
    apt-get install -y supervisor build-essential wget
RUN apt-get install -y python-pip python-dev nginx
RUN \
    cd /tmp && \
    wget http://nodejs.org/dist/node-latest.tar.gz && \
    tar xvzf node-latest.tar.gz && \
    rm -f node-latest.tar.gz && \
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

ENV APP_NAME=swagger-combined
COPY ./docker/${APP_NAME}.nginx /etc/nginx/sites-available/default

ADD . /build

EXPOSE 80:80

COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord"]
