# UI Previewer Button

[![Build status](https://travis-ci.org/rightscale/ui-previewer-button.svg)](https://travis-ci.org/rightscale/ui-previewer-button)

[Get it in the Chrome Web Store!][web-store]

Add links in pull requests to successful builds based on the SHA.

## For example

The minimal example is this repo itself: with this extension installed, viewing a PR on
this repo will add an icon to show the commit in patch format.

A better example is, if you [automatically build a UI on every push][scoutfile-post], you
can add a preview link to each commit, and to the PR as a whole, to test that UI
immediately. The same goes for docs builds, or anything else you can think of.

## Auto-configuration

If a repo hasn't been configured, and you're viewing the README of the repo, the UI
Previewer Button can auto-configure itself.

To set this up, [see below](#user-content-ui-previewer-button-config) or follow these
steps:

1. Add a header with the title 'UI Previewer Button config' (case doesn't matter).
2. Below that, add a code block with a valid JSON configuration object. To learn more
   about the format, visit the extension's options page, where you can also configure
   repos manually.

## UI Previewer Button config

```json
{
  "mainButton": {
    "urlPattern": "https://github.com/rightscale/ui-previewer-button/commit/${gitSha}.patch",
    "buttonText": "Patch",
    "icon": "file-text"
  }
}
```

[web-store]: https://chrome.google.com/webstore/detail/ui-previewer-button/calcadjojlbjppijehnmjhpccdhknodk?hl=en&gl=GB
[scoutfile-post]: http://eng.rightscale.com/2014/11/18/front-end-deployment.html
