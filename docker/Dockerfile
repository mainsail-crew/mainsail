FROM node:16-buster AS base

EXPOSE 8080

RUN apt-get update
RUN apt-get install -y zip

COPY docker/start-npm /usr/local/bin/start-npm
RUN chmod +x /usr/local/bin/start-npm

USER node

WORKDIR /home/node/mainsail

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci

COPY . .

ENTRYPOINT ["start-npm"]
