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
## for pause / resume / cancel functionality
These should be modified to your own needs.
{% raw %}
```yaml
[gcode_macro PAUSE]
rename_existing: BASE_PAUSE
gcode:
    ##### set defaults #####
    {% set x = params.X|default(230) %}      #edit to your park position
    {% set y = params.Y|default(230) %}      #edit to your park position
    {% set z = params.Z|default(10)|float %} #edit to your park position
    {% set e = params.E|default(1) %}        #edit to your retract length
    ##### calculate save lift position #####
    {% set max_z = printer.toolhead.axis_maximum.z|float %}
    {% set act_z = printer.toolhead.position.z|float %}
    {% set lift_z = z|abs %}
    {% if act_z < (max_z - lift_z) %}
        {% set z_safe = lift_z %}
    {% else %}
        {% set z_safe = max_z - act_z %}
    {% endif %}
    ##### end of definitions #####
    SAVE_GCODE_STATE NAME=PAUSE_state
    BASE_PAUSE
    G91
    G1 E-{e} F2100
    G1 Z{z_safe}
    G90
    G1 X{x} Y{y} F6000
```

```yaml
[gcode_macro RESUME]
rename_existing: BASE_RESUME
gcode:
    ##### set defaults #####
    {% set e = params.E|default(1) %} #edit to your retract length
    G91
    G1 E{e} F2100
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
{% endraw %}

# Optional

## customize klipper default commands
for example, if you want to adjust the `BED_MESH_CALIBRATE` command, which you can run from "heightmap > calibrate".
{% raw %}
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
{% endraw %}