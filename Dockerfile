#
# Builder stage, builds the application in node
#
FROM --platform=$BUILDPLATFORM node:20-alpine as builder

RUN apk add zip

WORKDIR /app
COPY package*.json /app/

RUN npm ci

COPY ./ /app/

RUN npm run build

#
# Runner stage, runs the application in nginx
#
FROM nginx:stable-alpine as runner

COPY --from=builder /app/.docker/nginx.conf  /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/
