---
layout: default
title: Update Manager
parent: Update Guides
nav_order: 1
has_children: false
permalink: /update/update-manager
---

# Update Manager

You can find further information on this topic by checking out the [Moonraker documentation](https://github.com/Arksine/moonraker/blob/master/docs/configuration.md#update_manager){:target="_blank"}.
{: .info}

## Enabling the feature

To use the built in Update Manager it must first be enabled by editing the moonraker.conf file:

```bash
cd ~/klipper_config
sudo nano moonraker.conf
```
Add the following section to your printers moonraker.conf:

```yaml
[update_manager]

[update_manager client mainsail]
type: web
repo: meteyou/mainsail
path: ~/mainsail
```

Restart  Moonraker:
```bash
sudo systemctl restart moonraker
```

## Using the Web UI

With the manager enabled reload the web ui and select the 'machine' tab from the sidebar. You should now see the Update Manager panel.

Holding shift whilst clicking the browser's refresh button (or pressing ctrl+f5) will force it to reload the page fully (without the cache).
{: .info}

Typically the update order is top to bottom.

![screenshot-updates-required](../assets/img/update/screenshot-update-manager-example-not-up-to-date.png)

To update a component, click the ![screenshot-update-button](../assets/img/update/screenshot-update-manager-button-rounded.png) button. 

A new window will launch and the component will be updated. When the update is finished, the window can be closed.

