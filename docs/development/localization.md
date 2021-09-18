---
layout: default
title: Localization
parent: Development
has_children: false
permalink: /development/localization
description: >-
  Mainsail uses [vue-i18n](https://kazupon.github.io/vue-i18n/) for its localization.
  All Locales can be found in the `/src/locales` directory in JSON format.
---

# {{ page.title }}
{{ page.description }}

## How to contribute

You can contribute in a couple of different ways:
1. Create/Update translations using an i18n translation tool.<br />
   (For Example: [BabelEdit](https://www.codeandweb.com/babeledit), [i18N-Manager](https://www.electronjs.org/apps/i18n-manager))
2. Create/Update translations using [VSCode](https://code.visualstudio.com/) and [i18n Ally](https://github.com/lokalise/i18n-ally).

If you have a finished translation file, you can make a [PR (pull request)](https://github.com/meteyou/mainsail/pulls)
on github or create an [issue](https://github.com/meteyou/mainsail/issues) on github and attach the translation.

## Testing

### Test your translations live
You can follow [this guide](https://docs.mainsail.xyz/development/standalone)
to start Mainsail in a "Debug Mode" and check your translation live. Alternatively
you can also use a docker container, instructions can be found 
[here](https://docs.mainsail.xyz/development/docker).

### Check the translation with vue-i18n-extract
Mainsail comes with [vue-i18n-extract](https://github.com/pixari/vue-i18n-extract) in the dev dependency,
with this tool, you can check your translation for missing or unused entries.

```shell
npm install           # only once and if you updated/installed packages
npm run i18n-extract  # starting i18n-extract to check all translation files
```
