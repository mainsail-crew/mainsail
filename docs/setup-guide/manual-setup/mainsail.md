---
layout: default
title: Mainsail
parent: Manual Setup Guide
grand_parent: Setup Guides
nav_order: 5
permalink: /setup/manual-setup/mainsail
---



## Mainsail
### Install webserver & reverse proxy (nginx)

nginx is important to mount all components on port 80 and host the static files from Mainsail. To install nginx you only need to execute:

`sudo apt install nginx`

now we create the config files with:

```
sudo touch /etc/nginx/sites-available/mainsail
sudo touch /etc/nginx/conf.d/upstreams.conf
sudo touch /etc/nginx/conf.d/common_vars.conf
```

Each file can be filled with the following content:

`sudo nano /etc/nginx/conf.d/upstreams.conf`

```
# /etc/nginx/conf.d/upstreams.conf

upstream apiserver {
    #if you need to change your api port, edit it here
    ip_hash;
    server 127.0.0.1:7125;
}

upstream mjpgstreamer {
    #if you need to change your webcam port, edit it here
    ip_hash;
    server 127.0.0.1:8080;
}
```
Save the file with `CTRL+O` and close the editor with `CTRL+X`.


`sudo nano /etc/nginx/conf.d/common_vars.conf`

```
# /etc/nginx/conf.d/common_vars.conf

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```
Save the file with `CTRL+O` and close the editor with `CTRL+X`.

`sudo nano /etc/nginx/sites-available/mainsail`

```
# /etc/nginx/sites-available/mainsail

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    access_log /var/log/nginx/mainsail-access.log;
    error_log /var/log/nginx/mainsail-error.log;

    #disable this section on smaller hardware like a pi zero
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_proxied expired no-cache no-store private auth;
    gzip_comp_level 4;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/json application/xml;

    #web_path from mainsail static files
    root /home/pi/mainsail;

    index index.html;
    server_name _;

    #disable max upload size
    client_max_body_size 0;

    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
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

    location ~ ^/(printer|api|access|machine|server)/ {
        proxy_pass http://apiserver$request_uri;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
    }

    location /webcam/ {
        proxy_pass http://mjpgstreamer/;
    }
}
```
Save the file with `CTRL+O` and close the editor with `CTRL+X`.

Create directory for static files and active nginx config:

```
mkdir ~/mainsail
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/mainsail /etc/nginx/sites-enabled/
sudo service nginx restart
```

Now you can check again the API if it works with the reverse proxy. Open the url http://\<printer-ip\>/printer/info in your browser. if you see a content like this:

```
{"result": {"hostname": "voron250", "error_detected": false, "version": "v0.8.0-479-gd586fb06", "is_ready": true, "message": "Printer is ready", "cpu": "4 core ARMv7 Processor rev 4 (v7l)"}}
```

Now we can install Mainsail (static httpdocs).

### Install httpdocs

Now you can download the current mainsail static data

```
cd ~/mainsail
wget -q -O mainsail.zip https://github.com/meteyou/mainsail/releases/latest/download/mainsail.zip && unzip mainsail.zip && rm mainsail.zip
```

Now it should be possible to open the interface: `http://<printer-ip>/`.

### Important macros

if you want to get the full experience with mainsail and klipper virtual_sdcard print, you should use these macros, or use them as templates for your own.

[Macro Link](../../necessary-cfg.md){: .btn target="_blank"}


### Change the Hostname (optional)

to use the hostname instate of the ip, you can install the avahi-daemon:

`sudo apt install avahi-daemon`

and you can config your hostname:

`sudo raspi-config`

in 2 Network Options > N1 Hostname you can edit your hostname of your raspberry pi. After a reboot you can use http://\<hostname\>.local/ to open the webinterface.


---
[< previous step](moonraker.md){: .btn }
