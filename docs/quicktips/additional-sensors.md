---
layout: default
title: Additional Sensors
parent: Quicktips
has_children: false
permalink: /quicktips/additional-sensors
description: >-
  Integrate additional sensors into the temperature graph. For example Raspberry Pi, MCU, BMExxx, HTU21D, LM75 and more..
---

# {{ page.title }}
{{ page.description }}

## Raspberry Pi temperature sensor

Append the following section to your printer.cfg:

```yaml
[temperature_sensor raspberry_pi]
sensor_type: temperature_host
min_temp: 10
max_temp: 100
```

## ATSAM, ATAMD, and STM32 temperature sensor

Append the following section to your printer.cfg:

```yaml
[temperature_sensor mcu_temp]
sensor_type: temperature_mcu
min_temp: 0
max_temp: 100
```

For more information on this topic and how to add additional sensors, please refer to [Klipper documentation](https://www.klipper3d.org/Config_Reference.html#builtin-micro-controller-temperature-sensor){:target="_blank"}.
{: .info}