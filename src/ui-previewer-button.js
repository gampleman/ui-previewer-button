if (PLATFORM === 'chrome' || !window.uiPreviewerButtonInjected) {
  window.uiPreviewerButtonInjected = true;

  function getConfig(callback) {
    if (PLATFORM === 'chrome' || PLATFORM === 'firefox') {
      chrome.runtime.sendMessage({method: 'getUiPreviewerButtonConfig'}, callback);
    } else if (PLATFORM === 'safari') {
      function handleMessage(event) {
        if (event.name === 'uiPreviewerResponse') {
          callback(event.message);
        }
        safari.self.removeEventListener("message", handleMessage, false);
      }
      safari.self.addEventListener("message", handleMessage, false);
      safari.self.tab.dispatchMessage('getUiPreviewerButtonConfig');
    }
  }

  function setConfig(settings) {
    if (PLATFORM === 'chrome' || PLATFORM === 'firefox') {
      chrome.runtime.sendMessage({method: 'setUiPreviewerButtonConfig', data: settings});
    } else if (PLATFORM === 'safari') {
      safari.self.tab.dispatchMessage('setUiPreviewerButtonConfig', settings);
    }
  }

  function appendIcon(iconName, element) {
    var span = document.createElement('span');
    span.className = 'octicon octicon-' + iconName;
    element.appendChild(span);
  }

  function main() {
    getConfig(function(options) {
      var locationParts = window.location.pathname.split('/'),
          repoPath = locationParts.slice(1, 3).join('/'),
          repo = options.repos[repoPath];

      if (!repo) {
        repo = Object.keys(options.repos).filter(function(name) {
          var repoRegexp = new RegExp('^' + name.replace('*', '.+') + '$', 'i');

          return repoRegexp.test(repoPath);
        })[0];
      }

      if (repo && window.location.pathname.match(/\/pull\/\d/i)) {
        attemptButtonInsertion(repo);
      } else if (locationParts.length === 3) {
        attemptConfigInsertion(repoPath, options);
      }
    });
  }

  function attemptConfigInsertion(repoPath, options) {
    var currentNode, newConfig,
        magicHeader = document.querySelector('#user-content-ui-previewer-button-config');

    if (!magicHeader) { return; }

    currentNode = magicHeader.parentNode;

    while (currentNode) {
      if (currentNode.classList && currentNode.classList.contains('highlight')) {
        newConfig = JSON.parse(currentNode.textContent);
        options.repos[repoPath] = newConfig;
        currentNode = null;
        setConfig(options);
      } else {
        currentNode = currentNode.nextSibling;
      }
    }
  }

  function attemptButtonInsertion(repo) {
    var link, href;
    if (repo.branch && !document.querySelector('#partial-discussion-header .uiPreviewer')) {
      var branch = document.querySelector('.current-branch:last-of-type').innerText.trim();
      var matches = (new RegExp(repo.branch.pattern, 'gi')).exec(branch);
      if (matches) {
        link = document.createElement('a');
        href = repo.branch.urlPattern.replace(/\$(\d)/, function(a, nstr) {
          var index = parseInt(nstr, 10);
          return matches[index];
        });
        link.href = href;
        link.className = 'uiPreviewer';
        appendIcon(repo.branch.icon, link);
        link.target = '_blank';
        document.querySelector('.current-branch:last-of-type').parentElement.appendChild(link);
      }

    }
    var parent = document.querySelector('.completeness-indicator-success+* .status-heading');
    var successfulCommits = Array.prototype.map.call(document.querySelectorAll('.commit-build-statuses  .text-success') || [], function(el) {
      return el.parentElement.parentElement.querySelector('code>.commit-id');
    }).filter(function(el) {return el;});
    if (successfulCommits.length > 0) {
      if (parent && !parent.querySelector('.uiPreviewer')) {
        if (repo.mainButton) {
          var hash = successfulCommits[successfulCommits.length - 1].href.match(/[a-z\d]{40}/i)[0];
          link = document.createElement('a');
          href = repo.mainButton.urlPattern.replace(/\${gitSha}/, hash);
          link.href = href;
          link.className = 'minibutton uiPreviewer';
          appendIcon(repo.mainButton.icon, link);
          link.style.marginRight = '0.2em';
          link.style.marginLeft = '0.4em';
          link.target = '_blank';
          parent.appendChild(link);
        }

        if (repo.secondary) {
          var secondary = document.createElement('a');
          href = repo.secondary.urlPattern.replace(/\${gitSha}/, hash);
          secondary.href = href;
          secondary.setAttribute('aria-label', repo.secondary.buttonText);
          secondary.className = 'minibutton tooltipped tooltipped-s uiPreviewer';
          appendIcon(repo.secondary.icon, secondary);
          secondary.style.marginRight = '0.4em';
          secondary.style.marginLeft = '0.2em';
          secondary.target = '_blank';
          parent.appendChild(secondary);
        }
        if (document.querySelector('.build-status-description > span:last-of-type')) {
          document.querySelector('.build-status-description > span:last-of-type').style.width = '60%';
        }
      }

      for (var i = 0, l = successfulCommits.length; i < l; i++) {
        if (!successfulCommits[i].parentElement.previousElementSibling.previousElementSibling) {
          hash = successfulCommits[i].href.match(/[a-z\d]{40}/i)[0];
          link = document.createElement('a');
          link.setAttribute('aria-label', repo.mainButton.buttonText);
          link.setAttribute('title', repo.mainButton.buttonText);
          href = repo.mainButton.urlPattern.replace(/\${gitSha}/, hash);
          link.href = href;
          link.className = 'uiPreviewer-link';
          appendIcon(repo.mainButton.icon, link);
          link.style.color = '#bbb';
          link.target = '_blank';
          parent = successfulCommits[i].parentElement.parentElement;
          parent.insertBefore(link, parent.firstChild);
        }
      }
    }
  }

  function isGitHubPageTransition(mutation) {
    return mutation.type === 'childList' && mutation.addedNodes.length;
  }

  var observer = new MutationObserver(function(mutations) {
    if (mutations.some(isGitHubPageTransition)) {
      main();
    }
  });

  observer.observe(document.querySelector('#js-repo-pjax-container'), {
    childList: true,
    attributes: false,
    characterData: false,
    subtree: true
  });

  main();
}