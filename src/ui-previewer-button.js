var options = JSON.parse(localStorage.uiPreviewerButtonOptions || '{"repos":{}}');

function main() {
  var repoPath = location.pathname.split('/').slice(1,3).join('/');
  var repo = options.repos[repoPath];
  if (!repo) {
    repo = (function() {
      for (var name in options.repos) {
        var repoRegexp = new RegExp('^' + name.replace('*', '.+') + '$', 'i');
        if (repoRegexp.test(repoPath)) {
          return options.repos[name];
        }
      }
    })();
  }
  if (repo && location.pathname.match(/\/pull\/\d/i)) {
    attemptButtonInsertion(repo);
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
      link.innerHTML = '<span class="octicon octicon-' + repo.branch.icon + '"></span> ' + repo.branch.buttonText;
      link.target = '_blank';
      document.querySelector('.current-branch:last-of-type').parentElement.appendChild(link);
    }

  }
  var parent = document.querySelector('.completeness-indicator-success+* .status-heading');
  var successfulCommits = Array.prototype.map.call(document.querySelectorAll('.commit-build-statuses  .text-success') || [], function(el) {
    return el.parentElement.parentElement.querySelector('code>.commit-id');
  }).filter(function(el) {return el;});
  if (successfulCommits.length > 0 && parent) {
    if (!parent.querySelector('.uiPreviewer')) {
      if (repo.mainButton) {
        var hash = successfulCommits[successfulCommits.length - 1].href.match(/[a-z\d]{40}/i)[0];
        link = document.createElement('a');
        href = repo.mainButton.urlPattern.replace(/\${gitSha}/, hash);
        link.href = href;
        link.className = 'minibutton uiPreviewer';
        link.innerHTML = '<span class="octicon octicon-' + repo.mainButton.icon + '"></span> ' + repo.mainButton.buttonText;
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
        secondary.innerHTML = '<span class="octicon octicon-' + repo.secondary.icon + '"></span> ';
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
        link.innerHTML = '<span class="octicon octicon-' + repo.mainButton.icon + '"></span> ';
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
