#
# Builder stage, builds the application in node
#
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

RUN apk add zip

WORKDIR /app
COPY package*.json /app/

RUN npm ci

COPY ./ /app/

RUN npm run build

# set port to >1024 port for non root running
RUN sed 's/80/8080/g' .docker/nginx.conf > .docker/nginx.conf.unprivileged

#
# Unprivileged runner stage, runs the application in nginx
#
FROM nginxinc/nginx-unprivileged:stable-alpine AS unprivileged

COPY --link --from=builder /app/.docker/nginx.conf.unprivileged  /etc/nginx/conf.d/default.conf
COPY --link --from=builder /app/dist/ /usr/share/nginx/html/

USER nginx

#
# Runner stage, runs the application in nginx
#
FROM nginx:stable-alpine AS runner

COPY --from=builder /app/.docker/nginx.conf  /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/
