---
layout: default
title: Hide macros, outputs or fans
parent: Quicktips
has_children: false
permalink: /quicktips/hide-gcode_macros
description: >-
  As you probably already noticed, you can show and hide the gcode macros in the interface settings, but there is more...
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

`MY_AWESOME_GCODE` appears in your interface settings, `_MY_HELPER_CODE` not.

![](../assets/img/quicktips/hide-gcode_macros/my_awesome_macro.png)

By the way, this also works for other configuration sections like, **fans and outputs.**
{: .info}

