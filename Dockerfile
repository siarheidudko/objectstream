FROM node:14.4.0-stretch
LABEL maintainer="slavianich@gmail.com"
RUN npm i nyc mocha -g
WORKDIR ./app
