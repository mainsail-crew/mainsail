---
layout: default
title: Klipper
parent: Update Guide
nav_order: 2
permalink: /update/klipper
---

## Klipper
### Update from Repository

To update Klipper directly from its repository, run the following command in a terminal:

```bash
cd ~/klipper
git pull
```

Restart Klipper using the command `sudo service klipper restart` and check the `klippy.log`.  if Klipper started correctly without any errors you may continue. 

### Klipper configuration changes
If you have any issues after updating your Klipper instance, you can check the configuration changes [here](https://github.com/KevinOConnor/klipper/blob/master/docs/Config_Changes.md).

---
[< table of contents](index.md){: .btn }  [next step >](moonraker.md){: .btn}
