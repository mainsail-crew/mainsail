FROM node:buster AS base

EXPOSE 8080

RUN apt-get update
RUN apt-get install -y zip

COPY start-npm /usr/local/bin/start-npm
RUN chmod +x /usr/local/bin/start-npm

USER node

WORKDIR /home/node/mainsail

ENTRYPOINT ["start-npm"]
