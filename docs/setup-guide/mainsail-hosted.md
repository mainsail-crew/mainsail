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

The hosted version of mainsail can be used:

* On the same (local) network as your printer.
* On a remote (different) network to your printer (requires the configuration of [remote access](../quicktips/remote-access)).

## Requirements

- MainsailOS and KIAUH are preconfigured to meet the requirements for the hosted service to work.
- If you have a manual installation, then the following requirements must be met:
  * Klipper must be installed.
  * Moonraker must be installed.
  * my.mainsail.xyz must be configured as a CORS domain in moonraker.conf.

## Editing moonraker.conf

Further information can be found in the Moonraker [documentation](https://moonraker.readthedocs.io/en/latest/configuration/#authorization)
{: .info}

To allow [my.mainsail.xyz](http://my.mainsail.xyz) to access your local installation, navigate to moonraker.conf open it and add the following code: 

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
