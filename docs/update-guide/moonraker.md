---
layout: default
title: Moonraker
parent: Update Guide
nav_order: 3
permalink: /update/moonraker
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

### Add Moonraker update manager
To use the update manager in Mainsail you have to add this in your moonraker.conf:
```
[update_manager]

[update_manager client mainsail]
type: web
repo: meteyou/mainsail
path: ~/mainsail
```

### Change Moonraker to systemd service (December 6th 2020)
Moonraker is now installed as a systemd service. If `moonraker.conf` is not located in the home directory, the command will looks something like the following:
```bash
~/moonraker/scripts/install-moonraker.sh -f -c /home/pi/klipper_config/moonraker.conf
```
This allows logging to stdout which can be viewed with the `journalctl -u moonraker command`.

### Update Moonraker dependence
This is only nessasary, if you see missing modules in the moonraker log.
```bash
~/moonraker/scripts/install-moonraker.sh -r
```

### Moonraker config changes
If you have issues after update your Moonraker instance, you can check config changes [here](https://github.com/Arksine/moonraker/blob/master/docs/user_changes.md).

---
[< previous step](klipper.md){: .btn }  [next step >](mainsail.md){: .btn }
