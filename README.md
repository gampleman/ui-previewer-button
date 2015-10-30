# UI Previewer Button

[Get it in the Chrome Web Store!][web-store]

Add links in pull requests to successful builds based on the SHA.

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
