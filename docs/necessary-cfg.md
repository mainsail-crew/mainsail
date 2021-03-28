---
layout: default
title: Necessary Configuration
nav_order: 5
has_children: false
permalink: /necessary-configuration
---

Mainsail requires a minimum configuration to function properly. It should give you a warning at startup if the required parts are not found in your configuration.

# Required configuration
## virtual_sdcard
This allows gcode file uploads.
```yaml
[virtual_sdcard]
path: ~/gcode_files
```

## display_status
This is required for messages in your status panel, if you don't have a `[display]` in your configuration.
```yaml
[display_status]
```

## pause / resume / cancel
This enables pause / resume in mainsail.

```yaml
[pause_resume]
```

# Macros
## for pause /resume / cancel functionality
These should be modified to your own needs.
```yaml
[gcode_macro PAUSE]
rename_existing: BASE_PAUSE
default_parameter_X: 230    #edit to your park position
default_parameter_Y: 230    #edit to your park position
default_parameter_Z: 10     #edit to your park position
default_parameter_E: 1      #edit to your retract length
gcode:
    SAVE_GCODE_STATE NAME=PAUSE_state
    BASE_PAUSE
    G91
    G1 E-{E} F2100
    G1 Z{Z}
    G90
    G1 X{X} Y{Y} F6000
```

```yaml
[gcode_macro RESUME]
rename_existing: BASE_RESUME
default_parameter_E: 1      #edit to your retract length
gcode:
    G91
    G1 E{E} F2100
    G90
    RESTORE_GCODE_STATE NAME=PAUSE_state MOVE=1
    BASE_RESUME
```

```yaml
[gcode_macro CANCEL_PRINT]
rename_existing: BASE_CANCEL_PRINT
gcode:
    TURN_OFF_HEATERS
    CLEAR_PAUSE
    SDCARD_RESET_FILE
    BASE_CANCEL_PRINT
```

# Optional

## customize klipper default commands
for example, if you want to adjust the `BED_MESH_CALIBRATE` command, which you can run from "heightmap > calibrate".
```yaml
[gcode_macro BED_MESH_CALIBRATE]
rename_existing: BASE_BED_MESH_CALIBRATE
gcode:
    #before the original gcode
    BED_MESH_CLEAR
    QUAD_GANTRY_LEVEL
    G1 X125 Y125 Z5 F6000
    #the original gcode
    BASE_BED_MESH_CALIBRATE
    #after the original gcode
```
