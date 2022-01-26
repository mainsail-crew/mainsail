---
layout: default
title: Slicer Upload
parent: Quicktips
permalink: /quicktips/slicer-upload
description: >-
  You can upload your sliced G-Code from within your slicer and have it start printing.
---

# {{ page.title }}
{{ page.description }}  
Moonraker is compatible with Octoprint's API. To enable Octoprint API compatibility, add the following to your `moonraker.conf` and restart Moonraker.

```
[octoprint_compat]
```


### PrusaSlicer / SuperSlicer (PrusaSlicer v2.3.0 and up)
Enable advanced or expert mode and change the options under `Printer Settings / General` as shown in the screenshot below. A "Physical Printer" must be configured in `Printer Settings / General`.

### PrusaSlicer / SuperSlicer (prior to PrusaSlicer v2.3.0)

Enable advanced or expert mode and change the options under `Printer Settings / General` as shown in the screenshot below.
For "API Key" you can type anything.

![screenshot](../assets/img/additional/FileUpload-PrusaSlicer-2.2.0.png)


### Cura with OctoPrint-Connect
Install the OctoPrint-Connection plugin in Cura's Marketplace. In Cura go to `Settings > Printer > Manage Printers`
and find the Button `Connect OctoPrint`. Add your printer and type anything in the `API Key` field.

![screenshot](../assets/img/additional/FileUpload-Cura-4.8.png)
