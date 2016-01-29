var webdriverio = require('webdriverio'),
    path = require('path'),
    extensionPath = path.join(__dirname, '/../build/chrome'),
    chromeOptions = {binary: process.env.CHROME_PATH, args: ['load-extension=' + extensionPath, '--test-type', '--no-sandbox']},
    options = {desiredCapabilities: {browserName: 'chrome', chromeOptions: chromeOptions}},
    client = webdriverio.remote(options);

client.init()
  .url('https://github.com/rightscale/ui-previewer-button')
  .pause(5000)
  .url('https://github.com/rightscale/ui-previewer-button/pull/1')
  .waitForExist('.uiPreviewer-link', 5000)
  .catch(function() {
    console.log(arguments[0]);
    console.log('UI Previewer Button not enabled');
    process.exit(1);
  })
  .then(function() {
      client.end().then(function() {
        console.log('UI Previewer Button enabled');
      });
  });
