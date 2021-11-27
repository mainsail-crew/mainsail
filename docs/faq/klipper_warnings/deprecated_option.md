---
layout: default
title: Deprecated Options
parent: Klipper Warnings
grand_parent: FAQ
nav_order: 20
has_children: false
permalink: /faq/klipper_warnings/deprecated_option
has_toc: false
---

# Deprecated Options

###### default_parameter
## Removal of `default_parameter_` for gcode macros.

In the past, default parameters for gcode macros were defined like so:

```yaml
[gcode_macro PRINT_START]
default_parameter_EXTRUDER: 230
gcode:
  ...
```
This would define a macro called `PRINT_START` that can be called with an `EXTRUDER` parameter like so: `PRINT_START EXTRUDER=200`. If no value is passed for `EXTRUDER` the default value of 230 is used. This style of default parameters has been deprecated. Instead, define your macro like so:

{% raw %}
```yaml
[gcode_macro PRINT_START]
gcode:
  {% set EXTRUDER_TEMP = params.EXTRUDER|default(230)|int %}
```
{% endraw %}
Take note of the following important aspects:
- Parameters passed to gcode macros are stored in the `params` object. So if your macro is called with `VALUE=50`, `params.VALUE` will contain the value 50. After the deprecation, only the `params` object will contain these values.
- Make sure to name your "set variable" something else as the name of the variable in the `params` object (see how I used `EXTRUDER_TEMP` for the "set variable" and `EXTRUDER` for the actual macro parameter above) to avoid confusion and possible parsing errors.
- If you want to pass a default, add `|default(<default value>)` to the end of the params variable (see above, where my default value is 10). 
- To ensure that `EXTRUDER_TEMP` will have an integer value, add `|int` to the end of the command, to turn passed parameters (if they exist) and the default into an integer. Depending on what kind of parameter you're passing, there are `|int` `|float` `|bool` or `|string` converters available. Make sure that you convert to int if you want to compare the values in your gcode macro.

The above description was provided by our community member [FHeilmann](https://github.com/FHeilmann){:target="_blank"} and we have his permission to publish it here. Thanks a lot!  
[Source](https://gist.github.com/FHeilmann/a8097b3e908e85de7255bbe6246ddfd5){:target="_blank"}.
{: .info}

###### step_distance
## Removal of `step_distance`

`step_distance` describes the distance covered by a certain axis with 1 stepper (micro-)step. The downside of this parameter (and one of the reasons for its removal, is that if one were to change the microstepping of a stepper, the step_distance changes as well. Klipper therefore removed the `step_distance` parameter in favor of `rotation_distance` and `full_steps_per_rotation`. These two parameters are unaffected by microstepping, and can be easily determined by inspecting the used hardware.

Perform the following steps to convert your config:
- comment out the old `step_distance` parameter
- add three new parameters:
  - `full_steps_per_rotation` this is 400 for 0.9 degree stepper motors and 200 for 1.8 degree stepper motors.
  - `rotation_distance` this can be determined either according to hardware, or by converting the old `step_distance` using math. 
  - `gear_ratio` can additionally be used to describe an axis that uses a reduction gear (like the Voron-2 Z axis)
  - The easiest way to obtain the correct values for `rotation_distance` and `gear_ratio` is to check the official Voron printer github repositories. All example configs have been updated to include the correct values for the new parameters. Keep in mind that you'll still have to calibrate your extruder steps/mm if you choose to copy the values for the extruder. Instructions on how to convert and recalibrate the extruder values can be found [here](https://github.com/Klipper3d/klipper/blob/master/docs/Rotation_Distance.md#extruder).
  - The formulas to convert `step_distance` to `rotation distance` can be found [here](https://github.com/Klipper3d/klipper/blob/master/docs/Rotation_Distance.md#obtaining-rotation_distance-from-steps_per_mm-or-step_distance)
  - Guidance on how to inspect your hardware to determine your conversion distance can be found [here](https://github.com/Klipper3d/klipper/blob/master/docs/Rotation_Distance.md#obtaining-rotation_distance-by-inspecting-the-hardware). Make sure to also consider any reduction gearing, if applicable, by checking [this section](https://github.com/Klipper3d/klipper/blob/master/docs/Rotation_Distance.md#using-a-gear_ratio) as well.
  - For every stepper, except your extruder, you should end up with even numbers (e.g. 40 instead of 39.9683).

The above description was provided by our community member [FHeilmann](https://github.com/FHeilmann){:target="_blank"} and we have his permission to publish it here. Thanks a lot!  
[Source](https://gist.github.com/FHeilmann/a8097b3e908e85de7255bbe6246ddfd5){:target="_blank"}.
{: .info}

###### pin_map
## Removal of `pin_map`

For Voron printers, this is only relevant if you're running an arduino based controller board and use pins named similar to `ar19` etc. These pin declarations are no longer valid and need to be replaced with their hardware pin identifiers. To find the appropriate hardware pin identifier perform a google image search for your board plus `pinout`. E.g.:

`arduino mega 2560 pinout` 

which will yield images such as this one:

![image](https://user-images.githubusercontent.com/4352664/138724260-5813281d-d62d-4b0c-87ee-1f64d301c15f.png)

There, find the pin you're trying to replace. The old pin maps use the digital number of the pin. For example, if your old pin was `ar10`, looking at the image you will find that the `D10` pin corresponds to `PB4`. Replace all pins in your config accordingly, and finally remove the `pin_map:` configuration parameter from your `mcu` section.

Alternatively, you can copy an appropriate `[board_pins]` block from [this location](https://github.com/Klipper3d/klipper/blob/master/config/sample-aliases.cfg) to your config. If you're using multiple arduinos, make sure to add the appropriate mcu to each block like so:

```yaml
[board_pins arduino-mega]
mcu: mcu
```

The above description was provided by our community member [FHeilmann](https://github.com/FHeilmann){:target="_blank"} and we have his permission to publish it here. Thanks a lot!  
[Source](https://gist.github.com/FHeilmann/a8097b3e908e85de7255bbe6246ddfd5){:target="_blank"}.
{: .info}

###### pid_integral_max
## Removal of `pid_integral_max`

Remove any instances of `pid_integral_max` from your config.

The above description was provided by our community member [FHeilmann](https://github.com/FHeilmann){:target="_blank"} and we have his permission to publish it here. Thanks a lot!  
[Source](https://gist.github.com/FHeilmann/a8097b3e908e85de7255bbe6246ddfd5){:target="_blank"}.
{: .info}
