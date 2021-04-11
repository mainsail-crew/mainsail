---
layout: default
title: Standalone
parent: Development
has_children: false
permalink: /development/standalone
description: >-
  Setup the project and start developing with your local printer(s)
---

# {{ page.title }}
{{ page.description }}

## Setup
Make a copy of the `.env.development.local.example` and omit the .example.
In the new file edit it to refect your desired printer:
```dotenv
#for your printer with moonraker running on 192.168.0.15
VUE_APP_HOSTNAME=192.168.0.15
```
In moonraker you need to add your local ip at the cors_domains:
```yaml
cors_domains:
    http://<your local ip>:<local port>
```
access the local running dev environment with `http://<your local ip>:<local port>`.
(for example: `http://localhost:8080`)

### Nodejs Environment >= v15.9.0
Linux
```shell
curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
```
Debian/Ubuntu
```shell
sudo apt-get install -y nodejs 
```
For other package-managers look here:
https://nodejs.org/en/download/package-manager/

## Start
```shell
npm install   # only once and if you updated/installed packages
npm run serve # starting current build with hot module reloading
```
