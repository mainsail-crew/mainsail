---
layout: themes
title: Community Themes
parent: Theming
nav_order: 100
has_children: false
permalink: /theming/themes
description: >-
  A collection of community themes for Mainsail.
---

# {{ page.title }}
{: .no_toc}
{{ page.description }}


## Setup Instructions
{: .no_toc}
Go to the repo of the theme and download it. Place the files according to  [these instructions](/theming/prepare#directory-structure).

[KIAUH](/setup/kiauh) has an integrated theme installer  
Go to `[Advanced] > [Theme installer]`, enter the desired theme <span class="key">id</span> and confirm with return.
{: .info}

<details closed markdown="block">
  <summary>
    List of themes
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

{% for theme in site.data.themes %}
---
## {{ theme.name }}
{{ theme.short_note }}
<div>id: <span class="key">{{ forloop.index}}</span></div>
  <div>author: <a href="https://github.com/{{ theme.author }}" target="_blank" alt="github.com">{{ theme.author }}</a></div>
  <div>url: <a href="https://github.com/{{ theme.author }}/{{ theme.repo }}" target="_blank" alt="github.com">{{ theme.author }}/{{ theme.repo }}</a></div>
  <img width="50%" id="img{{forloop.index}}" class="" loading="lazy" src="" alt="no screenshot found"/>
  
  <script>set_image('img{{forloop.index}}', 'https://raw.githubusercontent.com/{{ theme.author }}/{{ theme.repo }}/master/screenshot', 200000);</script>
<noscript><img width="50%" id="img{{forloop.index}}" class="screenshot" src="https://raw.githubusercontent.com/{{ theme.author }}/{{ theme.repo }}/master/screenshot.png" loading="lazy" alt="no screenshot found"/></noscript>
  
{% endfor %}


