---
layout: default
title: Setup Guides
nav_order: 2
has_children: true
permalink: /setup/
has_toc: false
---
# Setup Guides

To get started, you first have to decide which route you want to follow for the installation. There are several ways to install Mainsail on a Raspberry Pi.

- [MainsailOS](mainsail-os.md) <span class="label label-red">recommended</span>  
	A prebuilt image for your Raspberry Pi. Flash it and you are almost ready to go.
- [KIAUH](kiauh.md) - _Klipper Installation And Update Helper_  
	A script toolbox to install and keep Klipper, Moonraker and Mainsail up to date. It contains many additional features and is the way to go for multiprinter setups.
- [Manual Setup](manual-setup/index.md)  
	The rocky road. If you want to know how everything is set up by hand, you will get all the information here.

## my.mainsail.xyz
In addition to these guides, there is [my.mainsail.xyz](http://my.mainsail.xyz){: target="_blank"}. The latest Mainsail version is always hosted there. This obviates the need to set up a web server for Mainsail on your hardware.

To use [my.mainsail.xyz](http://my.mainsail.xyz){: target="_blank"}, the following requirements must be met:
- Klipper must be installed.
- Moonraker must be installed.
- my.mainsail.xyz must be configured as a CORS domain in moonraker.conf.

**MainsailOS & KIAUH already fulfill these requirements.**

_Note_, only the static .html, .js and .css files are loaded into your browser storage. No further information is transferred to the server. The communication to your printer is then done locally directly between your browser and your Moonraker installation.  
If you have any concerns, you can of course still install Mainsail on your hardware locally. Parallel operation is also possible.
{: .info}

