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

Insert the flashed SD card into your Pi and connect other desired/necessary hardware (ethernet, USB to 3D printer, webcam).

Power on the Pi and leave it to boot.

**The initial boot of  MainsailOS may take some time to expand your "root" filesystem. The larger the SD card, the longer the first boot will take.**
{: .warning}

Initially the green LED on the Pi will be extremely active. After some time it will only intermittently flicker, indicating it has likely completed the boot sequence.

The web ui should now be ready to access on your local network:

```
http://mainsailos.local
http://<IP address of your pi>
```

## Mainsail.cfg

 **Important:** Include the mainsail.cfg into your printer.cfg
{: .warning}

Mainsail will not work unless Klipper is told to include its configuration. This can be achieved either by placing the contents of mainsail.cfg into your printer.cfg.

To do this, open the default printer.cfg in the Mainsail web GUI:

![screenshot-web-editor](../../../assets/img/setup/screenshot-web-editor-printer.png)        

![screenshot-web-editor-printercfg](../../../assets/img/setup/screenshot-printercfg-include-mainsail.png)

Add the following line:

```yml
[include mainsail.cfg]
```
and click on the "Save & Restart" button.

## Updates

Once you've successfully navigated to the Mainsail web ui we _thoroughly_ recommend that you run updates.

Klipper, Moonraker and Mainsail have fast development cycles and whilst we do our best to ensure MainsailOS ships as close to the bleeding edge as we can, there will always be a short delay before releases make it into the image.

We recommend that you enable and use the [built in update-manager](../../update/update-manager) to perform a system update, then update the stack components (Klipper, Moonraker, Mainsail)

![screenshot-update-manager](../../../assets/img/update/screenshot-update-manager-example-not-up-to-date.png)


MainsailOS is now configured, and we can get Klipper's [printer.cfg](klipper-setup) setup.

---
[< tool selection](../mainsail-os.md){: .btn }  [next step >](klipper-setup){: .btn } 

