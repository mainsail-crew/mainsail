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
At first we have to install some OS dependencies:
```bash
sudo apt install virtualenv python-dev libffi-dev build-essential libncurses-dev libusb-dev avrdude gcc-avr binutils-avr avr-libc stm32flash dfu-util libnewlib-arm-none-eabi gcc-arm-none-eabi binutils-arm-none-eabi libusb-1.0 
```

The following commands will clone Klipper to an appropriate directory in HOME.
```bash
cd ~
git clone https://github.com/KevinOConnor/klipper
```

Then we can initialize the python virtual environment and install the python dependencies:
```bash
cd ~
virtualenv -p python2 ./klippy-env
./klippy-env/bin/pip install -r ./klipper/scripts/klippy-requirements.txt
```

## Configuration & startup service
After Klipper is installed, you will need to create a startup script to define log, config & UDS service location: 

To edit this file type:
```bash
sudo nano /etc/systemd/system/klipper.service
```

fill in these lines:
```yaml
#Systemd Klipper Service

[Unit]
Description=Starts Klipper and provides klippy Unix Domain Socket API
Documentation=https://www.klipper3d.org/
After=network.target
Before=moonraker.service
Wants=udev.target

[Install]
Alias=klippy
WantedBy=multi-user.target

[Service]
Environment=KLIPPER_CONFIG=/home/pi/klipper_config/printer.cfg
Environment=KLIPPER_LOG=/home/pi/klipper_logs/klippy.log
Environment=KLIPPER_SOCKET=/tmp/klippy_uds
Type=simple
User=pi
RemainAfterExit=yes
ExecStart= /home/pi/klippy-env/bin/python /home/pi/klipper/klippy/klippy.py ${KLIPPER_CONFIG} -l ${KLIPPER_LOG} -a ${KLIPPER_SOCKET}
Restart=always
RestartSec=10
```
Save the file with `CTRL+O` and close the editor with `CTRL+X`.

**Please check and modify the username!**  
If you do not use the user `pi`, you must replace it in each path and in the variable user in the service file.
{: .warning }

To enable and start the Klipper service execute these commands:
```bash
sudo systemctl enable klipper.service
```

You have to create the directories for your klipper configuration, logs and the virtual_sdcard directory:

```bash
mkdir ~/klipper_config
mkdir ~/klipper_logs
mkdir ~/gcode_files
touch ~/klipper_config/printer.cfg
```
After your config is in place, restart klipper with `sudo systemctl start klipper`.

---
[< previous step](operating-system.md){: .btn }  [next step >](moonraker.md){: .btn}
