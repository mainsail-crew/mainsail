---
layout: default
title: Hide macros, outputs or fans
parent: Quicktips
has_children: false
permalink: /quicktips/hide-gcode_macros
description: >-
  You can show and hide G-Code macros in the interface settings
---

# {{ page.title }}
{{ page.description }}

Did you know, that you can also hide gcode macros by prefixing the name with an underscore?

```yaml
[gcode_macro MY_AWESOME_GCODE]
gcode:
	_MY_HELPER_CODE
```

```yaml
[gcode_macro _MY_HELPER_CODE]
gcode:
	M300
```

`MY_AWESOME_GCODE` appears in your interface settings, `_MY_HELPER_CODE` does not.

![](../assets/img/quicktips/hide-gcode_macros/my_awesome_macro.png)

This also works for other configuration sections including **fans and outputs.**
{: .info}

