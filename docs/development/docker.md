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

# Setup
Install docker and docker-compose on your desired machine.

####Debian/Ubuntu
```shell
sudo apt install docker docker-compose
```
####Mac
https://docs.docker.com/docker-for-mac/install/
####Windows
https://docs.docker.com/docker-for-windows/install/

# Start
1. Look into the docker/config folder. Copy the ".example" without the "example ending".
2. Edit the configs to your likings. They are inital setup for a minimal setup environment with simulavr.
3. In the root directory of mainsail run
```shell
docker/run up
```

# Development
For development its sometimes needed to restart the simulavr process.
For this run:
```shell
docker exec -it mainsail-stack bash
```
in the spawnin shell run:
```shell
~/restart-services.sh
```
