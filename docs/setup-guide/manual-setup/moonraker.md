---
layout: default
title: Moonraker
parent: Manual Setup
grand_parent: Setup Guides
nav_order: 4
permalink: /setup/manual-setup/moonraker
---
# Moonraker
Moonraker is a web server that exposes APIs which lets Mainsail interact with Klipper.

## Installation
At first we have to install some OS dependencies:
```bash
sudo apt install python3-virtualenv python3-dev libopenjp2-7 python3-libgpiod curl libcurl4-openssl-dev libssl-dev liblmdb-dev libsodium-dev zlib1g-dev libjpeg-dev
```

Clone Moonraker into your HOME directory:
```bash
cd ~
git clone https://github.com/Arksine/moonraker.git
```

Then we can initialize the python virtual environment and install the python dependencies:
```bash
cd ~
virtualenv -p python3 ./moonraker-env
./moonraker-env/bin/pip install -r ./moonraker/scripts/moonraker-requirements.txt
```

## Configuration
**Please pay attention to the following steps!**  
Misconfigured trusted_clients are a very common source of failure.
{: .warning }

For Moonraker you'll need to create a separate config file.

`nano ~/klipper_config/moonraker.conf`

Insert the following part:
```
[server]
host: 0.0.0.0
port: 7125
enable_debug_logging: False
config_path: ~/klipper_config
log_path: ~/klipper_logs

[authorization]
cors_domains:
    https://my.mainsail.xyz
    http://my.mainsail.xyz
    http://*.local
    http://*.lan
trusted_clients:
    10.0.0.0/8
    127.0.0.0/8
    169.254.0.0/16
    172.16.0.0/12
    192.168.0.0/16
    FE80::/10
    ::1/128

# enables partial support of Octoprint API
[octoprint_compat]

# enables moonraker to track and store print history.
[history]

# this enables moonraker's update manager
[update_manager]

[update_manager mainsail]
type: web
repo: mainsail-crew/mainsail
path: ~/mainsail
```

**This is a very basic config**  
For more options and detailed explanations you should follow [arksines instructions](https://github.com/Arksine/moonraker/blob/master/docs/installation.md).
{: .info }

🔥 **trusted_clients - read carefully** 🔥  
A list of newline separated ip addresses and/or ip ranges that are
trusted. Trusted clients are given full access to the API.  Both IPv4
and IPv6 addresses and ranges are supported. Ranges must be expressed
in CIDR notation (see http://ip.sb/cidr for more info).  
For example, an entry of 192.168.1.0/24 will authorize IPs in the range of 192.168.1.1 -
192.168.1.254. Note that when specifying IPv4 ranges the last segment
of the ip address must be 0. The default is no clients or ranges are
trusted.
{: .alert }

Save the file with `CTRL+O` and close the editor with `CTRL+X`.

## Startup service
To edit this file type:
```bash
sudo nano /etc/systemd/system/moonraker.service
```

fill in these lines:
```yaml
#Systemd moonraker Service

[Unit]
Description=Moonraker provides Web API for klipper
Documentation=https://moonraker.readthedocs.io/en/latest/
After=network.target klipper.service

[Install]
WantedBy=multi-user.target

[Service]
Environment=MOONRAKER_CONFIG=/home/pi/klipper_config/moonraker.conf
Environment=MOONRAKER_LOG=/home/pi/klipper_logs/moonraker.log
Type=simple
User=pi
RemainAfterExit=yes
ExecStart=/home/pi/moonraker-env/bin/python /home/pi/moonraker/moonraker/moonraker.py -c ${MOONRAKER_CONFIG} -l ${MOONRAKER_LOG}
Restart=always
RestartSec=10
```
Save the file with `CTRL+O` and close the editor with `CTRL+X`.

**Please check and modify the username!**  
If you do not use the user `pi`, you must replace it in each path and in the variable user in the service file.
{: .warning }

To enable Moonraker service execute these commands:
```bash
sudo systemctl enable moonraker.service
```

After your config is in place, start Moonraker with `sudo systemctl start moonraker`.

Open the following url with your printers IP in your browser
```
http://<printer-ip>:7125/printer/info
```

If everything has been set up successfully, a message like this should appear:
```
{"result": {"state_message": "Printer is ready", "klipper_path": "/home/pi/klipper", "config_file": "/home/pi/klipper_config/printer.cfg", "software_version": "v0.9.1-785-g1be19177", "hostname": "raspberrypi", "cpu_info": "4 core ARMv7 Processor rev 4 (v7l)", "state": "ready", "python_path": "/home/pi/klippy-env/bin/python", "log_file": "/home/pi/klipper_log/klippy.log"}}
```

---
[< previous step](klipper.md){: .btn }  [next step >](mainsail.md){: .btn }
