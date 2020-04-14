# Klipper Web Control
KWC is a responsive web interface for [Klipper](https://github.com/KevinOConnor/klipper) 3D printer firmware. It communicates with the klipper-api from [Arksine](https://github.com/arksine). 

## Installation
At first install Arksine klipper-api fork/branch -> [install manual](https://github.com/Arksine/klipper/tree/work-web_server-20200131/klippy/extras/web_server)

Download and install KWC:
```bash
mkdir -p ~/kwc
cd ~/kwc
wget -q -O kwc.zip https://github.com/meteyou/kwc/releases/download/v0.0.7/kwc-alpha-0.0.7.zip && unzip kwc.zip && rm kwc.zip
```

Configure web_server in printer.cfg:
```
[web_server]
port: 8080
enable_cors: true
trusted_clients:
 192.168.1.0/24
 127.0.0.1
allow_file_ops_when_printing: true
```

Example Klipper macros:
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

## Installation lighttpd & haproxy
```bash
sudo apt install lighttpd haproxy
```
edit configfile `/etc/lighttpd/lighttpd.conf` and edit following lines:
```
server.document-root        = "/home/pi/kwc"
server.bind                 = "127.0.0.1"
server.port                 = 81
```
 
```bash
sudo usermod -a -G www-data pi
```

add following lines at the end of `/etc/haproxy/haproxy.cfg`:
```
frontend public
        bind :::80 v4v6
        default_backend lighttpd
        use_backend printer if { path_beg /printer/ }
#        use_backend webcam if { path_beg /webcam1/ }

        acl is_websocket path_beg /websocket
        acl is_websocket hdr(Upgrade) -i WebSocket
        acl is_websocket hdr_beg(Host) -i ws
        use_backend websocket if is_websocket

backend lighttpd
        reqrep ^([^\ :]*)\ /(.*)     \1\ /\2
        option forwardfor
        server lighttpd1 127.0.0.1:81

backend printer
        reqrep ^([^\ :]*)\ /(.*)     \1\ /\2
        option forwardfor
        server printer1 127.0.0.1:8080

backend websocket
        reqrep ^([^\ :]*)\ /(.*)     \1\ /\2
        option forwardfor
        server websocket1 127.0.0.1:8080

#backend webcam
#        reqrep ^([^\ :]*)\ /webcam1/(.*)     \1\ /\2
#        server webcam1 127.0.0.1:8081
```

all comments are for webcam support. You can install MJPEG-Streamer with this [tutorial](https://github.com/cncjs/cncjs/wiki/Setup-Guide:-Raspberry-Pi-%7C-MJPEG-Streamer-Install-&-Setup-&-FFMpeg-Recording).

## Installation nginx
```bash
sudo apt install nginx
```
create configfile `/etc/nginx/sites-available/kwc`:
```
map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
}

upstream apiserver {
        #edit your api port here
        server 127.0.0.1:8080;
}

server {
        listen 80 default_server;
        listen [::]:80 default_server;

        access_log /var/log/nginx/kwc-access.log;
        error_log /var/log/nginx/kwc-error.log;

        #web_path from kwc static files
        root /home/pi/kwc;

        index index.html;

        server_name _;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
        }

        location /printer {
                proxy_pass http://apiserver/printer;
        }

        location /websocket {
            proxy_pass http://apiserver/websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
        }
}
```

change api port & root path.

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/kwc /etc/nginx/sites-enabled/
sudo service nginx restart
```

## Update KWC to V0.0.7
```
rm -R ~/kwc/*
cd ~/kwc
wget -q -O kwc.zip https://github.com/meteyou/kwc/releases/download/v0.0.7/kwc-alpha-0.0.7.zip && unzip kwc.zip && rm kwc.zip
```
and update your macros