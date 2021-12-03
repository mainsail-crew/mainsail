---
layout: default
title: Deprecated Values
parent: Klipper Warnings
grand_parent: FAQ
nav_order: 10
has_children: false
permalink: /faq/klipper_warnings/deprecated_value
has_toc: false
---

# Deprecated Values

###### NTC 100K beta 3950
## Removal of `NTC 100K beta 3950` sensor type.

The "NTC 100K beta 3950" temperature sensor is _deprecated_ and will be removed in the near future. 

In order to solve the problem search in your config for `sensor_type: NTC 100K beta 3950` and replace it with `sensor_type: Generic 3950`.

Most users will find the "Generic 3950" temperature sensor more accurate. Anyway you can continue to use the older (typically less accurate) definition. Therefor define a custom thermistor with `temperature1: 25`, `resistance1: 100000`, and `beta: 3950`.

[Source](https://www.klipper3d.org/Config_Changes.html){:target="_blank"} Klipper Configuration Changes
{: .info}

###### rpi_temperature
## Removal of `rpi_temperature` sensor alias.

Replace `sensor_type: rpi_temperature` by `sensor_type: temperature_host` everywhere in your config.

The above description was provided by our community member [FHeilmann](https://github.com/FHeilmann){:target="_blank"} and we have his permission to publish it here. Thanks a lot!  
[Source](https://gist.github.com/FHeilmann/a8097b3e908e85de7255bbe6246ddfd5){:target="_blank"}.
{: .info}
