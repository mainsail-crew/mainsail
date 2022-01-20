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

## Preparing your custom theme
## .theme folder
You can use Mainsail's built-in file manager (`Settings > Machine`) to create the `.theme` folder.   Upload the files to this folder and edit your CSS files.

The dot in the folder name means that it is a hidden folder. You will need to activate "Show Hidden Files" in Mainsail's file manager.
{: .info}

![screenshot](../assets/img/customizing/screenshot-display-hidden-files.png)

## Directory structure
The below directory and file structure provides an overview of files you could include.  All listed files in the `.theme` folder are optional and will only be loaded if they are provided.
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
