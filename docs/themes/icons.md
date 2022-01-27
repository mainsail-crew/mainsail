---
layout: default
title: Logos and Icons
parent: Theming
nav_order: 20
permalink: /theming/favicons
description: >-
  Replace the default logos and icons with your own.
---

# {{ page.title }}
{{ page.description }}

You can use the built in file manager in `Settings > Machine` to upload your own logos and icons.  Customizing your icons can help identify your printers.

## Sidebar logo
Upload a logo into your .theme folder and name it `sidebar-logo.<extension>`, where extension is one of the valid file types below.

For more information on creating and uploading to your `.theme` folder, please refer to the [Customizing your theme](/theming/prepare) chapter.

| Filename					| sidebar-logo				|
| Valid file extensions		| .svg, .jpg, .png and .gif	|
| Recommended image size	| XxY px					|

![screenshot](../assets/img/customizing/screenshot-sidebar-logo.png)

## Favicons
Upload favicons into your .theme folder and name them `favicon-32x32.png` *(required)*	and `favicon-16x16.png` *(optional)*.

| Filename					| favicon-32x32 *(required)*	|
|							| favicon-16x16 *(optional)* 	|
| Valid file extensions		| .png							|
| Recommended image size	| 32x32px, 16x16px				|

A browser refresh may be necessary (CTRL+SHIFT+F5 on windows or CMD++SHIFT+R on macOS) to reload without the browser cache.
{: .info}

![screenshot](../assets/img/customizing/screenshot-favicons.png)


