---
layout: default
title: Mainsail
parent: Update Guide
nav_order: 4
permalink: /update/mainsail
---

## Updating Mainsail

To update Mainsail manually, run the commands below in your terminal:

```bash
cd ~/mainsail
rm -R ./*
wget -q -O mainsail.zip https://github.com/mainsail-crew/mainsail/releases/latest/download/mainsail.zip && unzip mainsail.zip && rm mainsail.zip
```

### Updating from 0.2.2 to 0.2.3 or higher

If you are updating from Mainsail version 0.2.2 to a newer version, you must move the file `gui.json` from the `gcodes` directory to the `klipper_config' directory.

This is only necessary when updating from 0.2.2 to 0.2.3 or higher. If you use MainsailOS, the virtual_sdcard directory is `gcode_files` instead of `sdcard`.
```
mv ~/sdcard/gui.json ~/klipper_config/
```

You should now be able to open Mainsail in your web browser at `http://<printer-ip>/`.

---
[< previous step](moonraker.md){: .btn }
