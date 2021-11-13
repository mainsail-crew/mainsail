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
wget -q -O mainsail.zip https://github.com/mainsail-crew/mainsail/releases/latest/download/mainsail.zip && unzip mainsail.zip && rm mainsail.zip
```

Now it should be possible to open the interface: `http://<printer-ip>/`.

---
[< previous step](moonraker.md){: .btn }
