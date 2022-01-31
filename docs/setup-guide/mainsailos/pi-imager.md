---
layout: default
title: Raspberry Pi Imager
parent: MainsailOS
grand_parent: Setup Guides
nav_order: 1
has_children: false
permalink: /setup/mainsailos/pi-imager
---

This method is cross-platform and works with Windows, Linux and MacOS
{: .info}

We **strongly** recommend you use a premium SD card from a reputable manufacturer such as Sandisk, Kingston or Samsung, using an "A1" (or better) grade SD card. \
\
Low end cards will often fail quickly when used in this application.
{: .warning}

**FLASHING WILL DESTROY ALL DATA ON YOUR SD CARD AND CANNOT BE REVERSED**
{: .alert}

____

# Preparation

*  [Download](https://github.com/mainsail-crew/MainsailOS/releases) the latest MainsailOS release (don't unpack the zip; you don't need to).
*  [Download](https://www.raspberrypi.org/software/) and install the latest Raspberry Pi Imager (aka. rpi-imager).

# Flashing MainsailOS

Raspberry Pi Imager appearance may vary depending on the host OS.
{: .info}


*  When opening rpi-imager you will be presented with the following:

![screenshot-imager-launched](img/rpi-imager-launched.png)

* Select "CHOOSE OS", and a popup will open as illustrated below. Select "Use custom" and navigate to the MainsailOS zip you downloaded.

![screenshot-imager-popup](img/rpi-os-popup.png)
![screenshot-imager-os-selected](img/rpi-choosen-os.png)

* Click on "STORAGE" and select your desired SD card.

![screenshot-imager-sd-card-selection](img/rpi-sdcard.png)

* Hostname, wi-fi, language and numerous other settings can now be scrolled through and pre-configured in a hidden setup menu, opened by pressing:

```bash
CTRL+SHIFT+X
```
As a bare minimumm setup SSH and a network connection (unless wired) at this point, especially if performing a 'headless' installation.
{: .info}

![screenshot-imager-rpi-preconfig1](img/rpi-setup-1.png)

![screenshot-imager-rpi-preconfig2](img/rpi-setup-2.png)

* With all desired options preconfigured, click on "WRITE" and accept the warning.

![screenshot-imager-warning](img/rpi-warning.png)

* Imager will take some time to write the disc image to the SD card. When it's finished, click continue.

![screenshot-imager-write-finished](img/rpi-finished.png)

Select the "CONTINUE" button and  unmount (safely remove) your newly flashed MainsailOS SD card.

You are now ready to move on to the [first boot](first-boot) of MainsailOS.


---
[< tool selection](../mainsail-os.md){: .btn }  [next step >](first-boot){: .btn }

