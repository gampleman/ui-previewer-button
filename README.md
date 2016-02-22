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

## Building

Make sure you have npm in your path. Run `make`. This will build as much as can be
reasonably automated for each supported platform. Unfortunately, to finish building,
test and deploy, you will need to do a few manual steps:

#### Firefox

1. You will need either a Nightly or Developer edition build.
2. Go to about:config, type `xpinstall.signatures.required` and change the setting to be `false`.
3. Go to about:addons and drag and drop the `build/artifacts/ui-previewer-button.xpi` to this page.
4. Click **Install**. Now you can play with your extension. If you rebuild, you will need to repeat steps 3 and 4.

#### Safari

1. Make sure you can see the Develop menu in the menu bar. If you can't, you can enable it in **Preferences > Advanced > Show Develop menu in menu bar**.
2. Click **Develop > Show Extension Builder**.
3. Click the litle **+** button in the bottom left and click **Add Extension...** in the pop-up menu.
4. Select `build/artifacts/ui-previewer-button.safariextension` in the dialog.
5. Click the **Install** button. Ignore the warnings and enter your password. Now the extension is loaded in your browser. If you rebuild, you only need to hit the **Reload** button. If you restart Safari, you will need to **Install** again.

#### Chrome

1. Go to chrome://extensions/.
2. Check the **Developer mode** checkbox.
3. Click **Load unpacked extension...**
4. Select `build/chrome` in the navigator. You now have the extension loaded in your browser. You can hit the **Reload** button to reload it when you rebuild.

## Deploying

Follow the instructions for building above. Then follow the following steps for each browser:

#### Firefox

1. Go to https://addons.mozilla.org
2. Register for an account.
3. Slack @gampleman to give you access.
4. Go to https://addons.mozilla.org/en-US/developers/addon/ui-previewer-button/versions#version-upload
5. Go through the wizard.

#### Chrome

1. Ask @alikhajeh1 to submit it for you.

#### Safari

Currently we don't have a certificate, so this doesn't work yet.

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
