# Mainsail
Mainsail is a responsive web interface for [Klipper](https://github.com/KevinOConnor/klipper) 3D printer firmware. It communicates with the klipper-api from [Arksine](https://github.com/arksine). 

## Requirement
You need a full working Klipper-instance. Install Klipper with the official Installation documentaion and check the Logfile if klipper (/tmp/klippy.log) works.

## Installtion of Mainsail
The installation is split into several sections

- [Change branch for Klipper-API](#change-brunch-for-klipper-api)
- [configure Klipper-API](#configure-klipper-api)
- [install webserver & reverse proxy (nginx)](#install-webserver--reverse-proxy-nginx)
- [install & configure Mainsail](#install--configure-mainsail)

### Change brunch for Klipper-API
The Klipper-API isn't merged in Klipper at the moment, so you have to change the Repository to [Arksine's Fork](https://github.com/Arksine/klipper/tree/work-web_server-20200131/klippy/extras/remote_api) with the Klipper-API.

```bash
cd ~/klipper
git remote add arksine https://github.com/Arksine/klipper.git
git fetch arksine
git checkout arksine/work-web_server-20200131
```
and install the python package "tornado"
```bash
~/klippy-env/bin/pip install tornado
```

### configure Klipper-API
edit your `printer.cfg` with `nano ~/printer.cfg` and add following lines:
```
[virtual_sdcard]
path: /home/pi/sdcard

[remote_api]
trusted_clients:
 192.168.0.0/24
 127.0.0.0/24
``` 
edit the first line of trusted_clients (192.168.0.0/24) to your network. The second line (127.0.0.0/24) is for reverse proxy later.
If you need other options in your API you can find all options with descriptions on [Arksine's Fork](https://github.com/Arksine/klipper/tree/work-web_server-20200131/klippy/extras/remote_api).

at last, we create the virtual_sdcard directory:
```
mkdir ~/sdcard
```
now restart klipper (`sudo service klipper restart`) and check your klippy-log if klipper is starting correct again.

when klipper is running, open the url `http://<printer-ip>:7125/printer/info` in your browser. if you see a content like this
```
{"result": {"hostname": "voron250", "error_detected": false, "version": "v0.8.0-479-gd586fb06", "is_ready": true, "message": "Printer is ready", "cpu": "4 core ARMv7 Processor rev 4 (v7l)"}}
```
your API is working!

### install webserver & reverse proxy (nginx)
nginx is important to mount all components on port 80 and host the static files from Mainsail.

If you have installed lighttpd & haproxy before you have to stop & disable it:
```bash
sudo service haproxy stop
sudo update-rc.d -f haproxy remove
sudo service lighttpd stop
sudo update-rc.d -f lighttpd remove
```

After disable all other webserver you can install nginx now:
```bash
sudo apt install nginx
```
now we create the config file with
```bash
sudo nano /etc/nginx/sites-available/mainsail
```
and fill it with the following content:
```
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

upstream apiserver {
    #edit your api port here
    ip_hash;
    server 127.0.0.1:7125;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    access_log /var/log/nginx/kwc-access.log;
    error_log /var/log/nginx/kwc-error.log;

    #web_path from mainsail static files
    root /home/pi/mainsail;

    index index.html;
    server_name _;

    #max upload size for gcodes
    client_max_body_size 200M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /printer {
        proxy_pass http://apiserver/printer;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
    }

    location /api {
        proxy_pass http://apiserver/api;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
    }

    location /access {
        proxy_pass http://apiserver/access;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
    }

    location /websocket {
        proxy_pass http://apiserver/websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    location /machine {
        proxy_pass http://apiserver/machine;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
    }
}
```
create directory for static files and active nginx config: 
```bash
mkdir ~/mainsail
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/mainsail /etc/nginx/sites-enabled/
sudo service nginx restart
```
now you can check again the API if it works with the reverse proxy. Open the url `http://<printer-ip>/printer/info` in your browser. if you see a content like this:
```
{"result": {"hostname": "voron250", "error_detected": false, "version": "v0.8.0-479-gd586fb06", "is_ready": true, "message": "Printer is ready", "cpu": "4 core ARMv7 Processor rev 4 (v7l)"}}
```
now we can install Mainsail.

### install & configure Mainsail
now you can download the current mainsail static data
```bash
cd ~/mainsail
wget -q -O mainsail.zip https://github.com/meteyou/mainsail/releases/download/v0.0.9/mainsail-alpha-0.0.9.zip && unzip mainsail.zip && rm mainsail.zip
```
now it should be possible to open the interface: `http://<printer-ip>/`.

to use the hostname instate of the ip, you can install the avahi-daemon:
```bash
sudo apt install avahi-daemon 
```
and you can config your hostname (if you use a raspberry pi):
```bash
sudo raspi-config
```
in `2 Network Options` > `N1 Hostname` you can edit your hostname of your raspberry pi. After a reboot you can use `http://<hostname>.local/` to open the webinterface.

## Klipper exampe macros for Mainsail
This macros are important to start/pause/cancel prints.
```
[pause_resume]

[gcode_macro CANCEL]
default_parameter_X: 230
default_parameter_Y: 230
default_parameter_Z: 10
gcode:
    M104 S0
    M140 S0
    M141 S0
    M106 S0
    CLEAR_PAUSE
    RESET_SD

[gcode_macro CANCEL_PRINT]
gcode:
    CANCEL

[gcode_macro PAUSE]
rename_existing: BASE_PAUSE
default_parameter_X: 230
default_parameter_Y: 230
default_parameter_Z: 10
gcode:
    SAVE_GCODE_STATE NAME=PAUSE_state
    BASE_PAUSE
    G91
    G1 E-1.7 F2100
    G1 Z{Z}
    G90
    G1 X{X} Y{Y} F6000
    G91

[gcode_macro RESUME]
rename_existing: BASE_RESUME
gcode:
    G91
    G1 E1.7 F2100
    G91
    RESTORE_GCODE_STATE NAME=PAUSE_state MOVE=1
    BASE_RESUME
```

## Update Mainsail to V0.0.9
```
rm -R ~/mainsail/*
cd ~/mainsail
wget -q -O kwc.zip https://github.com/meteyou/mainsail/releases/download/v0.0.9/mainsail-alpha-0.0.9.zip && unzip kwc.zip && rm kwc.zip
```
and update your macros & nginx config.