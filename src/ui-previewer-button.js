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

  function appendIcon(icon, element) {
    var span = document.createElement('span');
    if (!icon.match(/^\s*<\??(svg|xml|doctype)/i)) {
      icon = "<svg height=\"16\" width=\"16\" xmlns=\"http://www.w3.org/2000/svg\">\n  <path d=\"M11 10h3v-1H11v-1l3.17-1.03-0.34-0.94-2.83 0.97v-1c0-0.55-0.45-1-1-1v-1c0-0.48-0.36-0.88-0.83-0.97l1.03-1.03h1.8V1H9.8L7.8 3h-0.59L5.2 1H3v1h1.8l1.03 1.03c-0.47 0.09-0.83 0.48-0.83 0.97v1c-0.55 0-1 0.45-1 1v1L1.17 6.03l-0.34 0.94 3.17 1.03v1H1v1h3v1L0.83 12.03l0.34 0.94 2.83-0.97v1c0 0.55 0.45 1 1 1h1l1-1V6h1v7l1 1h1c0.55 0 1-0.45 1-1v-1l2.83 0.97 0.34-0.94-3.17-1.03v-1zM9 5H6v-1h3v1z\" />\n</svg>\n";
    }
    span.innerHTML = icon;
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
        if (repo.branch.buttonText) {
          var span = document.createElement('span');
          span.innerText = repo.branch.buttonText;
          link.appendChild(span);
        }
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
          if (repo.mainButton.buttonText) {
            link.setAttribute('aria-label', repo.mainButton.buttonText);
            link.className = 'minibutton tooltipped tooltipped-s uiPreviewer';
          }
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
          secondary.className = 'minibutton uiPreviewer';
          if (repo.secondary.buttonText) {
            secondary.setAttribute('aria-label', repo.secondary.buttonText);
            secondary.className = 'minibutton tooltipped tooltipped-s uiPreviewer';
          }
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
          link.className = 'uiPreviewer-link';
          if (repo.mainButton.buttonText) {
            link.setAttribute('aria-label', repo.mainButton.buttonText);
            link.setAttribute('title', repo.mainButton.buttonText);
          }

          href = repo.mainButton.urlPattern.replace(/\${gitSha}/, hash);
          link.href = href;

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
