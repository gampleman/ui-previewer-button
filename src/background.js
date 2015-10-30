chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status !== 'complete') { return; }

  chrome.tabs.executeScript(tabId, {code: 'window.uiPreviewerButtonInjected;'}, function(res) {
    if (res && !res[0]) {
      chrome.tabs.executeScript(tabId, {code: 'window.uiPreviewerButtonInjected = true;'});
      chrome.tabs.executeScript(tabId, {file: 'src/ui-previewer-button.js'});
    }
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.method === 'getUiPreviewerButtonConfig') {
    sendResponse(JSON.parse(localStorage.uiPreviewerButtonOptions || '{"repos": {}}'));
  } else if (request.method === 'setUiPreviewerButtonConfig') {
    localStorage[request.key] = JSON.stringify(request.data);
  }
});
