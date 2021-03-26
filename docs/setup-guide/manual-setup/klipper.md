---
layout: default
title: Klipper
parent: Manual Setup
grand_parent: Setup Guides
nav_order: 3
permalink: /setup/manual-setup/klipper
---

# Klipper
## Installation
The following commands will clone Klipper to an appropriate directory in HOME and run the setup script.
```bash
cd ~
git clone https://github.com/KevinOConnor/klipper
cd ~/klipper
./scripts/install-octopi.sh
```

## Configuration
After Klipper is installed, you will need to change the default location of the printer.cfg and add the UDS (unix domain socket). This is defined in the file `/etc/default/klipper` 

To edit this file type:
```bash
sudo nano /etc/default/klipper
```

find the following line:
```
KLIPPY_ARGS="/home/pi/klipper/klippy/klippy.py /home/pi/printer.cfg -l /tmp/klippy.log"
```
and change the config location to `/home/pi/klipper_config/printer.cfg` and add `-a /tmp/klippy_uds` to define UDS.
```
KLIPPY_ARGS="/home/pi/klipper/klippy/klippy.py /home/pi/klipper_config/printer.cfg -l /tmp/klippy.log -a /tmp/klippy_uds"
```
Save the file with `CTRL+O` and close the editor with `CTRL+X`.

You have to create the directories for your klipper configuration and the virtual_sdcard directory:

```bash
mkdir ~/klipper_config
mkdir ~/gcode_files
```

Move your printer.cfg to ~/klipper_config and check if the following entries are present in the config.
```ini
[virtual_sdcard]
# for gcode upload
path: ~/gcode_files

[display_status]
# for display messages in status panel

[pause_resume]
# for pause/resume functionality. 
# Mainsail needs gcode macros for `PAUSE`, `RESUME` and `CANCEL_PRINT` to make the buttons work.
```
**These entries are very important.**  
For the full functionality of mainsail, you should also define gcode macros for `PAUSE`, `RESUME` and `CANCEL_PRINT`. You'll find further information in [this](../../necessary-cfg.md){: target="_blank"} document.
{: .info }

After your config is in place, restart klipper with `sudo service klipper restart`.  Check the `/tmp/klippy.log` for errors, if Klipper starts correctly you can continue the guide.

---
[< previous step](operating-system.md){: .btn }  [next step >](moonraker.md){: .btn}
