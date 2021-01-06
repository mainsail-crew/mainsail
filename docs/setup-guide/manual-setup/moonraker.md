---
layout: default
title: Moonraker
parent: Manual Setup Guide
grand_parent: Setup Guides
nav_order: 4
permalink: /setup/manual-setup/moonraker
---
## Moonraker
Moonraker is a web server that exposes APIs which lets Mainsail interact with Klipper.

### Installation
Clone Moonraker into your HOME directory:
```bash
cd ~
git clone https://github.com/Arksine/moonraker.git
```

Run Moonrakers install script:
```bash
cd ~/moonraker/scripts
./install-moonraker.sh -c /home/pi/klipper_config/moonraker.conf
```

### Configuration
> ⚠️ **Please pay attention to the following steps!**  
Misconfigured trusted_clients are a very common source of failure.

For Moonraker you'll need to create a separate config file.

`nano ~/klipper_config/moonraker.conf`

Insert the following part and modify `trusted_clients` according to arksines description below.
Also consider further IP ranges, e.g. when connecting via VPN. To determine your local ip `ip a` and `ifconfig -a` are common ways to do so on Linux and `ipconfig` on Windows.

> ℹ️ **This is a very basic config**  
For more options and detailed explanations you should follow [arksines instructions](https://github.com/Arksine/moonraker/blob/master/docs/installation.md).

```
[server]
host: 0.0.0.0
config_path: ~/klipper_config

[authorization]
enabled: true
trusted_clients:
    192.168.1.0/24
    2a02:810d:9340:33f6::/64

[update_manager]
client_repo: meteyou/mainsail
client_path: ~/mainsail
```

> 🔥 **trusted_clients - read carefully** 🔥  
A list of newline separated ip addresses and/or ip ranges that are
trusted. Trusted clients are given full access to the API.  Both IPv4
and IPv6 addresses and ranges are supported. Ranges must be expressed
in CIDR notation (see http://ip.sb/cidr for more info).  
For example, an entry of 192.168.1.0/24 will authorize IPs in the range of 192.168.1.1 -
192.168.1.254. Note that when specifying IPv4 ranges the last segment
of the ip address must be 0. The default is no clients or ranges are
trusted.

Save the file with `CTRL+O` and close the editor with `CTRL+X`.

Restart Moonraker
```bash
sudo service moonraker restart
```

Open the following url with your printers IP in your browser
```
http://<printer-ip>:7125/printer/info
```

If everything has been set up successfully, a message like this should appear:
```
{"result": {"hostname": "voron250", "error_detected": false, "version": "v0.8.0-643-g528f9f25", "is_ready": true, "message": "Printer is ready", "cpu": "4 core ARMv7 Processor rev 4 (v7l)"}}
```

---
[< previous step](klipper.md){: .btn }  [next step >](mainsail.md){: .btn }
