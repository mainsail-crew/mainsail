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

Do **not** use an OctoPi image as it can cause unforeseen (avoidable) problems. 
{: .warning }
Don't forget to enable SSH and configure a network if using Wi-Fi.
{: .info}

It is recommended to use a clean [Raspberry Pi OS 32-bit Lite](https://downloads.raspberrypi.org/raspios_lite_armhf_latest){:target="_blank"} image (previously called Raspbian). 

We recommend you follow the RaspberryOS official [documentation](https://www.raspberrypi.org/documentation/installation/installing-images/){:target="_blank"}  to flash and install the operating system to your SD card. 

Once you have finished the installation and are connected via SSH, you can continue.

## Requirements

Install the required packages and update the system:

```bash
sudo apt update --allow-releaseinfo-change && sudo apt upgrade
sudo apt install git dfu-util unzip
```

**Verify that your distribution's Python 3 package(s) are version 3.7 or newer.**  
{: .alert }

Moonraker requires Python 3.7 and will not operate without it. 

You can check the current Python version installed to your operating system with the following terminal command:
```
python3 --version
```

---
[< table of contents](index.md){: .btn }  [next step >](klipper.md){: .btn }
