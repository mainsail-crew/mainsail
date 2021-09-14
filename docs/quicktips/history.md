---
layout: default
title: Print History/Stats
parent: Quicktips
has_children: false
permalink: /quicktips/history
description: >-
  Since Mainsail 1.5.0 it is possible to report and visualize print statistics. These contain various information such as print status, print duration, amount of filament used, etc.
---

# {{ page.title }}
{{ page.description }}  
It's also possible to reprint jobs.

![](../assets/img/quicktips/history/history.png){: style="width: 50%;"}

## Enable print history tracking

For this, it is necessary to enable print history tracking in moonraker.

Just add `[history]` to your moonraker.conf and restart moonraker.

The new history entry will appear in Mainsails sidebar.

