---
layout: default
title: Mainsail
parent: Manual Update
grand_parent: Update Guides
nav_order: 4
permalink: /update/manual-update/mainsail
---

## Mainsail
```bash
cd ~/mainsail
rm -R ./*
wget -q -O mainsail.zip https://github.com/meteyou/mainsail/releases/latest/download/mainsail.zip && unzip mainsail.zip && rm mainsail.zip
```

### Move gui.json from gcodes to klipper_config
This is only necessary if you update from 0.2.2 to 0.2.3 or higher. If you use MainsailOS, the virtual_sdcard directory is `gcode_files` instead of `sdcard`.
```
mv ~/sdcard/gui.json ~/klipper_config/
```

Now it should be possible to open the interface: `http://<printer-ip>/`.

---
[< previous step](moonraker.md){: .btn }
