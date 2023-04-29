#
# Builder stage, builds the application in node
#
FROM --platform=$BUILDPLATFORM node:18-alpine as builder

RUN apk add zip

WORKDIR /app
COPY package*.json /app/

RUN npm install

COPY ./ /app/

ARG BASE="/"
ENV VITE_BASE="$BASE"

RUN npm run build

#
# Runner stage, runs the application in nginx
#
FROM nginx:stable-alpine as runner

ARG BASE="/"
COPY --from=builder /app/.docker/nginx.conf  /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html$BASE
