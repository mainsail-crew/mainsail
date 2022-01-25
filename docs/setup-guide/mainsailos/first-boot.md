---
layout: default
title: First boot
parent: MainsailOS
grand_parent: Setup Guides
nav_order: 3
has_children: false
permalink: /setup/mainsailos/first-boot
---


# First boot

Insert the flashed SD card into your Pi and connect any other hardware such a network cable, USB cable to the 3D printer, or a webcam.

Power on the Pi and let it boot up.

**The initial boot of  MainsailOS may take some time to expand your "root" filesystem. The larger the SD card, the longer the first boot will take.**
{: .warning}

Initially the green LED on the Pi will be extremely active. After some time it will only intermittently flicker, indicating it has likely completed the boot sequence.

The web interface should now be ready to access on your local network:

```
http://mainsailos.local
```
or 
```
http://<IP address of your Pi>
```

## Mainsail.cfg

 **Important:** Include `mainsail.cfg` in your printer.cfg file
{: .warning}

Mainsail will not work correctly until `mainsail.cfg` is included in Klipper's configuration file.  Open Klipper's default `printer.cfg` file in Mainsail's file manager located in `Settings > Machine`.  If you do not have a `printer.cfg` file, you can create one. Add the following line to `printer.cfg` 

```
[include mainsail.cfg]
```

![screenshot-web-editor](../../../assets/img/setup/screenshot-web-editor-printer.png)        

![screenshot-web-editor-printercfg](../../../assets/img/setup/screenshot-printercfg-include-mainsail.png)

and click on  the`Save & Restart` button.

## Updates

Once you've successfully navigated to the Mainsail's web interface it is _strongly_ recommend that you run any available updates.
{: .info}

Klipper, Moonraker and Mainsail have fast development cycles and while we do our best to ensure MainsailOS ships as close to upstream as we can, there will always be a short delay before releases make it into MainsailOS' image.

It is recommended that you enable and use the [built in update-manager](../../update/update-manager) to perform any system updates, then update Klipper, Moonraker, Mainsail as needed.

![screenshot-update-manager](../../../assets/img/update/screenshot-update-manager-example-not-up-to-date.png)


MainsailOS is now configured, and Klipper's configuration file, [printer.cfg], can be setup.

---
[< tool selection](../mainsail-os.md){: .btn }  [next step >](klipper-setup){: .btn } 

