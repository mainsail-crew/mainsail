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
description: Pause the actual running print
rename_existing: PAUSE_BASE
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
    PAUSE_BASE
    G91
    {% if printer.extruder.can_extrude|lower == 'true' %}
      G1 E-{e} F2100
    {% else %}
      {action_respond_info("Extruder not hot enough")}
    {% endif %}
    {% if "xyz" in printer.toolhead.homed_axes %}    
      G1 Z{z_safe}
      G90
      G1 X{x} Y{y} F6000
    {% else %}
      {action_respond_info("Printer not homed")}
    {% endif %}
```

```yaml
[gcode_macro RESUME]
description: Resume the actual running print
rename_existing: RESUME_BASE
gcode:
    ##### set defaults #####
    {% set e = params.E|default(1) %} #edit to your retract length
    #### get VELOCITY parameter if specified ####
    {% if 'VELOCITY' in params|upper %}
      {% set get_params = ('VELOCITY=' + params.VELOCITY)  %}
    {%else %}
      {% set get_params = "" %}
    {% endif %}
    ##### end of definitions #####
    G91
    {% if printer.extruder.can_extrude|lower == 'true' %}
      G1 E{e} F2100
    {% else %}
      {action_respond_info("Extruder not hot enough")}
    {% endif %}  
    RESUME_BASE {get_params}
```


```yaml
[gcode_macro CANCEL_PRINT]
description: Cancel the actual running print
rename_existing: CANCEL_PRINT_BASE
gcode:
    TURN_OFF_HEATERS
    CANCEL_PRINT_BASE
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