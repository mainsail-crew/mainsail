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
In the new file edit it to reflect your desired printer:
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

### Prepare nodejs using nvm
POSIX-compliant shell (sh, dash, ksh, zsh, bash)
unix, macOS, and windows WSL
```shell
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
nvm install node
```

make sure you run node >=15.9.0
```shell
node -v
```

#### Troubleshoot 
follow this guide if you encouter problems with nvm   
https://github.com/nvm-sh/nvm#troubleshooting-on-linux


## Start
```shell
npm install   # only once and if you updated/installed packages
npm run serve # starting current build with hot module reloading
```
