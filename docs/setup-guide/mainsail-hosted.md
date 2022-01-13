---
layout: default
title: my.mainsail.xyz
parent: Setup Guides
nav_order: 4
has_children: false
has_toc: false
permalink: /setup/mainsail-hosted
---

# my.mainsail.xyz

Mainsail and MainsailOS respect [Data Privacy](../data-privacy). 
{: .info}

The hosted version of Mainsail can be used on the same local network with your printer or on a different remote to network and requires you to setup [remote access](../quicktips/remote-access).

## Requirements

- MainsailOS and KIAUH are preconfigured to meet the requirements for the hosted service.
- If you have a manual installation, the following requirements must be met:
  * Klipper
  * Moonraker
  * `my.mainsail.xyz` must be configured as a CORS domain in `moonraker.conf`.

### Editing moonraker.conf for remote access

You can  learn more about editing Moonraker's authorization [configuration documentation here.](https://moonraker.readthedocs.io/en/latest/configuration/#authorization)
{: .info}

To configure [my.mainsail.xyz](http://my.mainsail.xyz) for access with your local installation, open `moonraker.conf`  and add the following `authorization` section: 

```yml
[authorization]
cors_domains:
    https://my.mainsail.xyz
    http://my.mainsail.xyz
    http://*.local
trusted_clients:
 10.0.0.0/8
 127.0.0.0/8
 169.254.0.0/16
 172.16.0.0/12
 192.168.0.0/16
 FE80::/10
 ::1/128

```
