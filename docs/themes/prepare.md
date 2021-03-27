---
layout: default
title: Prepare
parent: Theming
nav_order: 1
permalink: /theming/prepare
description: >-
  Create a basic folder structure to build your own theme.
---

# {{ page.title }}
{{ page.description }}

## .theme folder
You only need to create a ".theme" folder in your config folder.  
There you will place all the files you need to personalize Mainsail.

You can use Mainsail's built-in file manager `(Settings > Machine)` to create the .theme folder and upload all the files and edit your css-files.

The dot in the folder name means that it is a hidden folder. Therefore you have to activate "show hidden files".
{: .info}

![screenshot](../assets/img/customizing/screenshot-display-hidden-files.png)

## directory structure
We have prepared the following simple overview for you. 
Please refer to the separate instructions for details.

All listed files in the .theme folder are optional and will only be loaded if they are provided.
{: .info}

```
+-- ..
|-- klipper_config
|   |-- .theme
|   |   |-- sidebar-logo.svg|jpg|png|gif
|   |   |-- sidebar-background.jpg|png|gif
|   |   |-- main-background.jpg|png|gif
|   |   |-- favicon-16x16.png
|   |   |-- favicon-32x32.png
|   |   |-- custom.css
|   |   |-- ...
```