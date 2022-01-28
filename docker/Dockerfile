FROM node:16-alpine AS base

EXPOSE 8080

RUN apk add zip bash

COPY docker/start-npm /usr/local/bin/start-npm
RUN chmod +x /usr/local/bin/start-npm

USER node

WORKDIR /home/node/mainsail

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

COPY . .

ENTRYPOINT ["start-npm"]
