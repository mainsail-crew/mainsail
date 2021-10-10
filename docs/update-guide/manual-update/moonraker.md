---
layout: default
title: Moonraker
parent: Manual Update
grand_parent: Update Guides
nav_order: 3
permalink: /update/manual-update/moonraker
---

## Moonraker
```bash
cd ~/moonraker
git pull
```

Restart Moonraker (`sudo service moonraker restart`) and open the url `http://<printer-ip>:7125/printer/info` in your browser.

If you see a content like this
```
{"result": {"hostname": "voron250", "error_detected": false, "version": "v0.8.0-643-g528f9f25", "is_ready": true, "message": "Printer is ready", "cpu": "4 core ARMv7 Processor rev 4 (v7l)"}}
```

### Update Moonraker dependence
This is only nessasary, if you see missing modules in the moonraker log.
```bash
~/moonraker/scripts/install-moonraker.sh -r
```

### Moonraker config changes
If you have issues after update your Moonraker instance, you can check config changes [here](https://moonraker.readthedocs.io/en/latest/user_changes/){:target="_blank"}.

---
[< previous step](klipper.md){: .btn }  [next step >](mainsail.md){: .btn }
