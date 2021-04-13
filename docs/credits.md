---
layout: default
title: Credits
nav_order: 100
has_children: false
permalink: /credits
description: >-
  Credits for our contributors
---

# {{ page.title }}
{: .no_toc }
<!-- {{ page.description }} -->


We would like to say "thank you" to all the

- contributors, who help make Mainsail better
- testers, who help find bugs in Mainsail, so they can be quickly fixed
- supporters via patreon/ko-fi

and of course the projects Mainsail is built on, especially [Klipper](https://github.com/KevinOConnor/klipper){:target="_blank"}, [Moonraker](https://github.com/Arksine/moonraker){:target="_blank"} and [MainsailOS](https://github.com/raymondh2/MainsailOS/){:target="_blank"}.

**THANK YOU for YOUR support. ❤️**

- TOC
{:toc}

# Contributors

| contributor | link |
|:--------|:-----|
{% for contributor in site.data.contributors %}{% if contributor.login != "meteyou" and contributor.login != "dependabot[bot]" %}|![]({{ contributor.avatar_url }}){: style="width: 20px; vertical-align: bottom;"} **{{ contributor.login }}**|[{{ contributor.html_url }}]({{ contributor.html_url }}){:target="_blank"}|
{% endif %}{% endfor %}

# Licenses

| project | license | link |
|:--------|:-------:|:-----|
{% for deps in site.data.licenses %}| **{{ deps[0] }}**<br>{{ deps[1].description }} | [{{ deps[1].licenses }}]({{ deps[1].licenseUrl }}){:target="_blank"} | [{{ deps[1].repository }}]({{ deps[1].repository }}){:target="_blank"} |
{% endfor %}