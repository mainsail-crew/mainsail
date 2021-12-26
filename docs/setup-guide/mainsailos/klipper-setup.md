---
layout: default
title: Klipper
parent: MainsailOS
grand_parent: Setup Guides
nav_order: 4
has_children: false
permalink: /setup/mainsailos/klipper-setup
---

# Klipper setup

Please read and follow the [Klipper documentation](https://klipper3d.org) in order to setup your machine. 
{: .info}
You do not need to follow instructions pertaining to Octopi or Octoprint found in the Klipper documentation.
{: .info}

Klipper is a highly versatile piece of software and can run with almost any machine. Due to the plethora of stock and custom hardware options available, it is impossible to ship MainsailOS / Klipper with a default configuration that would work for everyone.

## Modifying/constructing  printer.cfg

**You must enter parts of this configuration manually, as it is specific to your printer and MCU hardware**
{: .warning}  

To customise your printer.cfg you will need to SSH to your Pi and:

```yml
cd ~/klipper_config
nano printer.cfg
```
Then follow the [Klipper documentation](https://klipper3d.org) to construct your printer.cfg file. 

---

Before progressing to the next step, ensure that you have:

* Correctly built the firmware and [flashed the MCU](https://www.klipper3d.org/Installation.html#building-and-flashing-the-micro-controller)
* Correctly written/customised your printer.cfg file using the [Klipper configuration reference](https://www.klipper3d.org/Config_Reference.html).
* Checked and then [verified your printer.cfg](https://www.klipper3d.org/Config_checks.html).


---
[< first boot](first-boot){: .btn }  [next step >](../pre-flight){: .btn }


