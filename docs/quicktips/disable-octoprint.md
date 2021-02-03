---
layout: default
title: Disable Octoprint LCD menu
parent: Quicktips
has_children: false
permalink: /quicktips/disable-octoprint-lcd-menu
description: >-
  Klipper is shipped with an Octoprint entry in the LCD menu. These menu points don't work with Mainsail.
---
 
# {{ page.title }}
{{ page.description }}

## Modify printer.cfg
Just add the following entry to your printer.cfg:

```yaml
[menu __main __octoprint]
type: disabled
```
