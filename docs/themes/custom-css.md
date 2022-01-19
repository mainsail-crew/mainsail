---
layout: default
title: Custom CSS
parent: Theming
nav_order: 30
permalink: /theming/custom-css
---

# Custom CSS 

The `custom.css` file allows you to customize the appearance of Mainsail
without the need of rebuilding it.  Place a file named `custom.css` in the `.theme` folder of your Mainsail installation and define your custom **C**ascading **S**tyle **S**heets (CSS) rules inside the file.

![file-screenshot](../assets/img/customizing/screenshot-custom-css.png "custom.css file")

![example result](../assets/img/customizing/screenshot-custom-css-example-result.png "custom.css result")


## Customizing the CSS

You need to be familiar with the CSS syntax to customize Mainsail.  There are many resources available to learn CSS online, for example:
- https://www.w3schools.com/css/default.asp

### Finding the Element to Customize

You will need to use your browser's built in developer tools to find the element you want to customize.  You can do this by clicking the "Developer Tools" button in the browser's toolbar or by right clicking on the page and choosing `Inspect Element` or press `F12`.

![open dev-tools](../assets/img/customizing/screenshot-custom-css-inspect.png "open dev-tools")

1. Activate the developer tools and inspector
2. Select the desired element
3. Find the selector
4. Use the style editor to customize the element.  Play around to find the style you like!

![find element](../assets/img/customizing/screenshot-custom-css-find-element.png "find the right element")

![fiddle](../assets/img/customizing/screenshot-custom-css-fiddle.png "fiddle")

When you have achieved your desired appearance, copy the full "section", including the selector and curly braces.

![fiddle 2](../assets/img/customizing/screenshot-custom-css-fiddle-2.png "fiddle 2")

Next copy it inside the "custom.css" file (you can keep everything or only what you have added)

![example](../assets/img/customizing/screenshot-custom-css-example.png "custom.css example")

NOTE: After saving, your browser may need a uncached reload to show the change. Visit [Wikipedia to learn how.](https://en.wikipedia.org/wiki/Wikipedia:Bypass_your_cache#Bypassing_cache)
