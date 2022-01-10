---
layout: default
title: Update Manager
parent: Quicktips
has_children: false
permalink: /quicktips/update-manager
description: >-
  Perform updates of Mainsail, Klipper, Moonraker and your system from within Mainsail.
---
 
# {{ page.title }}
{{ page.description }}

## Moonraker.conf

To enable updates in Mainsail's web interface, add the following section to your printer's `moonraker.conf`:

```yaml
[update_manager]

[update_manager client mainsail]
type: web
repo: mainsail-crew/mainsail
path: ~/mainsail
```

Restart the Moonraker service and the Update Manager will appear in Mainsail's machine settings.

![](../assets/img/quicktips/update-manager/update-manager.png)


You can find further information on this topic by visiting the [Moonraker documentation](https://github.com/Arksine/moonraker/blob/master/docs/configuration.md#update_manager){:target="_blank"}.
{: .info}
