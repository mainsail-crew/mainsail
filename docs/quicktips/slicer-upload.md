---
layout: default
title: Slicer Upload
parent: Quicktips
permalink: /quicktips/slicer-upload
description: >-
  It is possible to upload G-Code from  your slicer and have it start printing.
---

# {{ page.title }}
{{ page.description }}  
Moonraker has compatibility with Octoprint's legacy file upload API.

### PrusaSlicer/SuperSlicer (prior to v2.3.0)

If not already been done, switch to advanced or expert mode and set the options under `Printer Settings / General` as shown in the screenshot below.
For "API Key" you can type anything.

![screenshot](../assets/img/additional/FileUpload-PrusaSlicer-2.2.0.png)

### PrusaSlicer/SuperSlicer (since v2.3.0)
A "Physical Printer" must be defined to configure the settings from above.  
More detailed instructions will follow.
