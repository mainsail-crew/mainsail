---
layout: default
title: Print History and Statistics
parent: Quicktips
has_children: false
permalink: /quicktips/history
description: >-
  You can view your print history and statistics in the History section of Mainsail.  
  
---

# {{ page.title }}
{{ page.description }}  
This includes print job status, duration, amount of filament used, and more.  You can also reprint a print job.

![](../assets/img/quicktips/history/history.png){: style="width: 50%;"}

## Enable print history tracking

To enable print history tracking, you must first enable this feature in Moonraker.

Add `[history]` to your `moonraker.conf ` configuration file and restart Moonraker.

The new history entry will appear in Mainsail's sidebar.

