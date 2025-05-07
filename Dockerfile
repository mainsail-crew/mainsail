#
# Builder stage, builds the application in node
#
FROM --platform=$BUILDPLATFORM node:20-alpine as builder

# setup unprivileged user for runner image
RUN <<PASSWD cat > /etc_passwd && <<GROUP cat > /etc_group
mainsail:x:1000:1000:mainsail:/:
PASSWD
mainsail:x:1000:mainsail
GROUP

RUN apk add zip

WORKDIR /app
COPY package*.json /app/

RUN npm ci

COPY ./ /app/

RUN npm run build

#
# Runner stage, runs the application in nginx
#
FROM nginxinc/nginx-unprivileged:stable-alpine as runner

COPY --link --from=builder /app/.docker/nginx.conf  /etc/nginx/conf.d/default.conf
COPY --link --from=builder /app/dist/ /usr/share/nginx/html/
COPY --link --from=builder /etc_group /etc/group
COPY --link --from=builder /etc_passwd /etc/passwd

USER mainsail
