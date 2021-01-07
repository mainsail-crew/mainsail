---
layout: default
title: MainsailOS Guide
parent: Setup Guides
nav_order: 1
has_children: false
permalink: /setup/mainsail-os
---
# Installing Mainsail with MainsailOS

The recommended way to install Mainsail on a Raspberry Pi is to use [MainsailOS](https://github.com/raymondh2/MainsailOS),
a pre-packaged disk image. If you are building a custom configuration, you may need to skip
these instructions and install Mainsail [manually](manual-setup/index.md).

1. Download the latest mainsailOS  [Release](https://github.com/raymondh2/MainsailOS/releases)
2. Unzip the .img file from your download.
3. Use [BalenaEtcher](https://www.balena.io/etcher/) to write the .img on to an 8GB, or larger SDcard.  *THIS WILL DESTROY ALL DATA ON YOUR CARD*.

_note: It is a good idea to use a premium SDcard from a reputable manufacturer such as Sandisk, Kingston or Samsung. Low end cards will often fail quickly when used in this application_

4. If you will be using wifi, edit the file `mainsailos-wpa-supplicant.txt` with your Wifi information. If you are having trouble seeing this file on the sdcard, try removing it and re-inserting it into your card reader.
5. Make sure that your MCU(s) is connected to your pi, If you will be using wired networking, also make sure your ethernet cable is connected.
5. Insert the SDcard into your Pi, and power on the Pi.
6. Find your pi on the network, and ssh into it, (Using PuTTY on Windows or the terminal on MacOS)
    * If your network supports bonjour, the pi should show up as `mainsailos.local`
    * If your network automatically assigns DNS hostnames, it may simply show up as `mainsailos`
    * Failing these two options, you may need to check your router's DHCP server, and find out what IP address as been assigned to the device.