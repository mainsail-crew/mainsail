---
layout: default
title: Operating System
parent: Manual Setup
grand_parent: Setup Guides
nav_order: 2
permalink: /setup/manual-setup/operating-systen
description: >-
  Manual Setup: tips and recommendations for the OS.
---

# {{ page.title }}
{{ page.description }}

**Please don't use an OctoPi image!**  
It can cause unforeseeable events, like rips in the space-time continuum. So be aware!  
No seriously. Experiences have shown that it is advisable not to use an OctoPi image (especially for beginners).
{: .warning }

It is recommended to use a clean Raspberry Pi OS 32-bit Lite image (previously called Raspbian). You can download it [here](https://downloads.raspberrypi.org/raspios_lite_armhf_latest){:target="_blank"}.  
For more information about installing Raspberry Pi OS click [here](https://www.raspberrypi.org/documentation/installation/installing-images/){:target="_blank"}. Don't forget to enable ssh.

Once you have finished the installation and are connected via ssh, you can continue.

## Requirements
```bash
sudo apt update && sudo apt upgrade
sudo apt install git dfu-util unzip
```

**Moonraker requires Python 3.7 or greater,** verify that your distribution's Python 3 packages meet this requirement.  
{: .alert }

```
python3 --version
```

---
[< table of contents](index.md){: .btn }  [next step >](klipper.md){: .btn }
