---
layout: default
title: Thumbnails
parent: Additional Support
nav_order: 1
permalink: /additional/thumbnails
---

## Thumbnails

Mainsail can display thumbnails in the file browser and as previews in the print status.

![preview](../assets/img/additional/large-preview.png)

### SuperSlicer (since v2.2.54.0)

In "Expert" mode SuperSlicer has some very convenient options in the "printer settings" tab to activate and customize the previews.

![SuperSlicer](../assets/img/additional/SuperSlicer-thumbnails.png)

### PrusaSlicer/SuperSlicer

To enable thumbnails, click on `Help > Show Configuration Folder` and navigate to your printer profiles inside the `printer` folder.
Open your printer profile in a text editor and find `thumbnails =` and add the resolutions `32x32,400x300`. Save the file and restart your Slicer.

![PrusaSlicer](../assets/img/additional/PrusaSlicer-thumbnails.png)

From now on the gcode files contain thumbnails displayed by mainsail.
