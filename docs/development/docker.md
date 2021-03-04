---
layout: default
title: Docker
parent: Development
has_children: false
permalink: /development/docker
description: >-
  Setup docker and docker-compose for quick full stack mainsail development with simulavr without any real printer
---

# {{ page.title }}
{{ page.description }}

## Setup
Install docker and docker-compose on your desired machine.

### Debian/Ubuntu
```shell
sudo apt install docker docker-compose
```
### Mac
https://docs.docker.com/docker-for-mac/install/
### Windows
https://docs.docker.com/docker-for-windows/install/

## Start
1. Look into the docker/config folder. Copy the ".example" without the "example ending".
2. Edit the configs to your likings. They are inital setup for a minimal setup environment with simulavr.
3. In the root directory of mainsail run
```shell
docker/run up
```

## Development
### Commands
```shell
docker/run ps                 # showing running containers
docker/run restart <api/npm>  # restarting container
                              # api: restarting complete api container with simulavr/moonraker/klipper services,
                              # npm: restarting nodejs container with running 'npm run serve' 
docker/run bash <api/npm>     # spawning bash shell inside container
```
Restarting the api container will happen a lot, because simulavr WILL crash a lot! Timings within simulavr are not precise and klipper will bug alot about that.
## Todo
1. The current implementation of simulavr/moonraker/klipper is kinda naiv, because docker wont run with systemd.
I will fix that in later versions of the docker container, so you can restart specific containers and omit simulavr and bind a real connected printer for example.
