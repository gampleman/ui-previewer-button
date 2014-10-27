chrome.runtime.onMessage.addListener(function(m, sender, resp) {
  var options = localStorage.uiPreviewerOptions;
  console.log('hello', options, chrome);
  if (options) {
    options = JSON.parse(options);
  } else {
    options = {
      repos: {
        'rightscale/analytics_ui': {
          mainButton: {
            urlPattern: 'https://analytics.rightscale.com/?scout=${gitSha}',
            buttonText: 'Preview UI',
            icon: 'eye'
          },
          secondary: {
            urlPattern: 'https://analytics-assets.rightscale.com/${gitSha}/docs/index.html',
            buttonText: 'Docs',
            icon: 'book'
          }
        }
      }
    };
  }
  resp(options);
});
