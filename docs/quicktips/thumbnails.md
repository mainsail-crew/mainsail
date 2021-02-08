---
layout: default
title: Thumbnails
parent: Quicktips
permalink: /quicktips/thumbnails
description: >-
  Mainsail can display thumbnails in the file browser and as previews in the print status.
---

# {{ page.title }}
{{ page.description }}

![preview](../assets/img/additional/large-preview.png)

### PrusaSlicer (since v2.3.0)

In "Expert" mode PrusaSlicer has an option in the "Printer Settings" tab to activate previews.
Under `General / Firmware`, enter `32x32,400x300` as "G-code thumbnails".

![SuperSlicer](../assets/img/additional/PrusaSlicer2.3.0-thumbnails.png)

### SuperSlicer (since v2.2.54.0)

In "Expert" mode SuperSlicer has some very convenient options in the "Printer Settings" tab to activate and customize the previews.

![SuperSlicer](../assets/img/additional/SuperSlicer-thumbnails.png)

### PrusaSlicer/SuperSlicer

To enable thumbnails, click on `Help > Show Configuration Folder` and navigate to your printer profiles inside the `printer` folder.
Open your printer profile in a text editor and find `thumbnails =` and add the resolutions `32x32,400x300`. Save the file and restart your Slicer.

![PrusaSlicer](../assets/img/additional/PrusaSlicer-thumbnails.png)

From now on the gcode files contain thumbnails displayed by mainsail.
