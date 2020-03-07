# Klipper Web Control
KWC is a responsive web interface for [Klipper](https://github.com/KevinOConnor/klipper) 3D printer firmware. It communicates with the klipper-api from [Arksine](https://github.com/arksine). 

## Installation
At first install Arksine klipper-api fork/branch -> [install manual](https://github.com/Arksine/klipper/tree/work-web_server-20200131/klippy/extras/web_server)

Download and install KWC:
```bash
mkdir -p ~/kwc
cd ~/kwc
wget https://github.com/meteyou/kwc/releases/download/V0.0.2/kwc-alpha-0.0.2.zip
unzip *.zip && for f_ in $(find . | grep '.gz');do gunzip ${f_};done
```

Configure web_server in printer.cfg:
```
[web_server]
port: 8080
trusted_clients:
 192.168.1.0/24
web_path: ~/kwc
pause_gcode: PAUSE_PRINT
resume_gcode: RESUME_PRINT
cancel_gcode: CANCEL_PRINT
```

Example Klipper macros:
```
[pause_resume]

[gcode_macro CANCEL_PRINT]
gcode:
    M104 S0
    M140 S0
    M141 S0
    M106 S0
    CLEAR_PAUSE

[gcode_macro PAUSE_PRINT]
default_parameter_X: 230
default_parameter_Y: 230
default_parameter_Z: 10
gcode:
    SAVE_GCODE_STATE NAME=PAUSE_state
    PAUSE
    G91
    G1 E-1.7 F2100
    G1 Z{Z}
    G90
    G1 X{X} Y{Y} F6000
    G91

[gcode_macro RESUME_PRINT]
gcode:
    G91
    G1 E1.7 F2100
    G91
    RESTORE_GCODE_STATE NAME=PAUSE_state MOVE=1
    RESUME
```

## Update KWC to V0.0.2
```
rm -R ~/kwc/*
cd ~/kwc
wget https://github.com/meteyou/kwc/releases/download/V0.0.2/kwc-alpha-0.0.2.zip
unzip *.zip && for f_ in $(find . | grep '.gz');do gunzip ${f_};done
```