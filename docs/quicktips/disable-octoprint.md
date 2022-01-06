---
layout: default
title: Disable Octoprint LCD menu
parent: Quicktips
has_children: false
permalink: /quicktips/disable-octoprint-lcd-menu
description: >-
  Klipper ships with an Octoprint entry in the LCD menu which does not work with Mainsail.
---
 
# {{ page.title }}
{{ page.description }}

## Modify printer.cfg
Add the following entry to your printer.cfg to disable Octoprint:

```yaml
[menu __main __octoprint]
type: disabled
```
