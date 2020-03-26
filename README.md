# Klipper Web Control
KWC is a responsive web interface for [Klipper](https://github.com/KevinOConnor/klipper) 3D printer firmware. It communicates with the klipper-api from [Arksine](https://github.com/arksine). 

## Installation
At first install Arksine klipper-api fork/branch -> [install manual](https://github.com/Arksine/klipper/tree/work-web_server-20200131/klippy/extras/web_server)

Download and install KWC:
```bash
mkdir -p ~/kwc
cd ~/kwc
wget -q -O kwc.zip https://github.com/meteyou/kwc/releases/download/v0.0.5/kwc-alpha-0.0.5.zip && unzip kwc.zip && rm kwc.zip
```

Configure web_server in printer.cfg:
```
[web_server]
port: 8080
enable_cors: true
trusted_clients:
 192.168.1.0/24
 127.0.0.1
web_path: ~/kwc
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

## Installation haproxy
haproxy is necessary to use port 80.

`sudo apt install haproxy`

add following lines at the end of `/etc/haproxy/haproxy.cfg`:
```
frontend public
        bind :::80 v4v6
#        use_backend webcam if { path_beg /webcam/ }
        default_backend kwc

backend kwc
        reqrep ^([^\ :]*)\ /(.*)     \1\ /\2
        option forwardfor
        server kwc1 127.0.0.1:8080

#backend webcam
#        reqrep ^([^\ :]*)\ /webcam/(.*)     \1\ /\2
#        server webcam1 127.0.0.1:8081
```


## Update KWC to V0.0.5
```
rm -R ~/kwc/*
cd ~/kwc
wget -q -O kwc.zip https://github.com/meteyou/kwc/releases/download/v0.0.5/kwc-alpha-0.0.5.zip && unzip kwc.zip && rm kwc.zip
```
and update your macros