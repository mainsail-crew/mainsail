#
# Builder stage, builds the application in node
#
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk add zip

WORKDIR /app
COPY package*.json /app/

RUN npm ci

COPY ./ /app/

RUN npm run build && rm /app/dist/mainsail.zip

# set port to >1024 port for non root running
RUN sed 's/80/8080/g' .docker/nginx.conf > .docker/nginx.conf.unprivileged

#
# Unprivileged runner stage, runs the application in nginx
#
FROM nginxinc/nginx-unprivileged:stable-alpine AS unprivileged

USER root
RUN rm -rf /usr/share/nginx/html/*
COPY --link --from=builder /app/.docker/nginx.conf.unprivileged  /etc/nginx/conf.d/default.conf
COPY --link --from=builder /app/dist/ /usr/share/nginx/html/
COPY --chmod=755 --link --from=builder /app/.docker/00-remove-ipv6-if-unavailable.sh /docker-entrypoint.d/

USER nginx

#
# Runner stage, runs the application in nginx
#
FROM nginx:stable-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/.docker/nginx.conf  /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY --chmod=755 --from=builder /app/.docker/00-remove-ipv6-if-unavailable.sh /docker-entrypoint.d/
