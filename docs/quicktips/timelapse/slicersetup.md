---
layout: default
title: Slicer Setup
nav_order: 2
grand_parent: Quicktips
parent: Timelapse
has_children: false
permalink: /quicktips/timelapse/slicersetup
description: >-
  To use the "layermacro" mode which grabs a frame every layerchange you need to add the TIMELAPSE_TAKE_FRAME macro to your slicer so that it is added to the Gcode before or after a layer change. If your slicer do not support adding Gcode to a layerchange you are limited to timebased "hyperlapse" mode.
---

# {{ page.title }}
{{ page.description }}

## Prusa Slicer / Super Slicer
Printer Settings -> Custom G-code -> Before layer change Gcode -> ``TIMELAPSE_TAKE_FRAME``

![screenshot-prusaslicer](https://github.com/mainsail-crew/moonraker-timelapse/blob/main/docs/assets/img/timelapse-PS-config.png)


## Ultimaker Cura
Extensions -> Post Processing -> Modify G-Code ->
Add a script -> Insert at layer change -> G-code to insert = ``TIMELAPSE_TAKE_FRAME``

![screenshot-cura](https://raw.githubusercontent.com/mainsail-crew/moonraker-timelapse/main/docs/assets/img/timelapse-cura-config.png)

## Ideamaker
Advanced Settings -> Gcode -> Layer Change Gcode -> ``TIMELAPSE_TAKE_FRAME``
![screenshot-ideamaker](https://raw.githubusercontent.com/mainsail-crew/moonraker-timelapse/main/docs/assets/img/timelapse-ideamaker-config.png)
(Credits to Vez3d for the screenshot)
