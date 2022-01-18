---
layout: default
title: Presets
parent: Quicktips
has_children: false
permalink: /quicktips/presets
description: >-
  Mainsail supports so-called presets. They are often used for preheat & cooldown, but also execute normal gcode.
---

# {{ page.title }}
{{ page.description }}

## Setup
In Mainsails interface settings you will find a section called "Preheat Presets". There you can set your presets via "ADD PRESET" and the following dialog.

### Preheat

Enter a name for your preset, such as filament, color or other text and the temperature you wish to set the preset at. You can disable individual heaters and even specify a custom gcode for the preheat phase. The G-Code will be executed after the selected temperatures are set.

![](../assets/img/quicktips/presets/preheat.png)

### Further Examples

#### Z-Offset
You can add custom G-Code to make it easier to switch between different Z-Offsets.  This makes it easier to work with different surfaces and flexplates.

To configure the G-Code enter `SET_GCODE_OFFSET Z=0.2`, and change `0.2` to the offset you need.

![](../assets/img/quicktips/presets/gcodeoffset.png)