if (PLATFORM == 'chrome' || PLATFORM == 'firefox') {
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.status !== 'complete') { return; }

    if (PLATFORM == 'chrome') {
      chrome.tabs.executeScript(tabId, {code: 'window.uiPreviewerButtonInjected;'}, function(res) {
        if (res && !res[0]) {
          // chrome.tabs.executeScript(tabId, {code: 'window.uiPreviewerButtonInjected = true;'});
          chrome.tabs.executeScript(tabId, {file: 'src/ui-previewer-button.js'});
        }
      });
    } else if(PLATFORM == 'firefox') {
      chrome.tabs.executeScript(tabId, {file: 'src/ui-previewer-button.js'});
    }
  });

  if (PLATFORM === 'firefox') {
    chrome.contextMenus.create({
      type: 'normal',
      contexts: ['all'],
      id: 'show-options',
      title: 'Configure UI Previewer',
      active: true,
      selected: true,
      onclick: function() {
        chrome.tabs.create({
          url: '/src/options/index.html'
        });
      }
    });
  }
}

if (PLATFORM === 'safari') {
  safari.application.addEventListener('command', function(event) {
    if (event.command === 'configure') {
      safari.application.activeBrowserWindow.openTab().url = safari.extension.baseURI + 'src/options/index.html';
    }
  }, false);
}

function getSettings() {
  return JSON.parse(localStorage.uiPreviewerButtonOptions || '{"repos": {}}');
}

function setSettings(settings) {
  localStorage.uiPreviewerButtonOptions = JSON.stringify(settings);
}

if (PLATFORM == 'chrome' || PLATFORM == 'firefox') {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === 'getUiPreviewerButtonConfig') {
      sendResponse(getSettings());
    } else if (request.method === 'setUiPreviewerButtonConfig') {
      setSettings(request.data);
    }
  });
} else if (PLATFORM == 'safari') {
  safari.application.addEventListener('message', function(event) {
    if (event.name === 'getUiPreviewerButtonConfig') {
      event.target.page.dispatchMessage('uiPreviewerResponse', getSettings());
    } else if (event.name === 'setUiPreviewerButtonConfig') {
      setSettings(event.message);
    }
  }, false);
}
