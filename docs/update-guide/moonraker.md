---
layout: default
title: Moonraker
parent: Update Guide
nav_order: 3
permalink: /update/moonraker
---

## Updating Moonraker

To update Moonraker directly from its repository, run the following command in a terminal:

```bash
cd ~/moonraker
git pull
```

Restart Moonraker using the command `sudo service moonraker restart` and open the URL `http://<printer-ip>:7125/printer/info` in your browser.

Your printer is updated and ready if you see the following message:
```
{"result": {"hostname": "voron250", "error_detected": false, "version": "v0.8.0-643-g528f9f25", "is_ready": true, "message": "Printer is ready", "cpu": "4 core ARMv7 Processor rev 4 (v7l)"}}
```

### Add Moonraker to the update manager

If you want to update Moonraker using the update manager, you need to add the following section to your printer's `moonraker.conf`:

```
[update_manager]

[update_manager client mainsail]
type: web
repo: mainsail-crew/mainsail
path: ~/mainsail
```

### Moonraker as a systemd service
As of December 2020, Moonraker is added as a systemd service during installation.  If `moonraker.conf` is not located in the home directory, run this command in your terminal:
```bash
~/moonraker/scripts/install-moonraker.sh -f -c /home/pi/klipper_config/moonraker.conf
```
This allows logging to `stdout` which can be viewed with the command `journalctl -u moonraker` in your terminal.

### Update Moonraker's dependencies
Updating Moonraker's dependecencies manually is only needed if you see missing modules in the Moonraker log.  You can run the following command to update Moonraker's dependencies:
```bash
~/moonraker/scripts/install-moonraker.sh -r
```

### Moonraker configuration changes
If you have issues after updating Moonraker, please review the list of changes requiring user intervention [here](https://github.com/Arksine/moonraker/blob/master/docs/user_changes.md).

---
[< previous step](klipper.md){: .btn }  [next step >](mainsail.md){: .btn }
