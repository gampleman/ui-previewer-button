var options;
chrome.runtime.sendMessage({gimme: 'gimme'}, function(req) {
	options = req;
	setInterval(function() {
		var repoPath = location.pathname.split('/').slice(1,3).join('/');
		var repo = options.repos[repoPath];
		if (repo && location.pathname.match(/\/pull\/\d/i)) {
			attemptButtonInsertion(repo);
		}
	}, 1000);
});


function attemptButtonInsertion(repo) {
	var parent = document.querySelector('.branch-status');
	var successfulCommits = document.querySelectorAll('.status-success + code>.commit-id');
	if (successfulCommits && parent) {
		if (!parent.querySelector('.uiPreviewer')) {
			var hash = successfulCommits[successfulCommits.length - 1].href.match(/[a-z\d]{40}/i)[0];
			var link = document.createElement('a');
			var href = repo.mainButton.urlPattern.replace(/\${gitSha}/, hash);
			link.href = href;
			link.className = 'minibutton uiPreviewer';
			link.innerHTML = '<span class="octicon octicon-' + repo.mainButton.icon + '"></span> ' + repo.mainButton.buttonText;
			link.style.float = 'right';
			link.style.marginTop = '-0.4em';
			link.style.marginRight = '0.4em';
			link.target = '_blank';
			parent.insertBefore(link, parent.firstChild);

			if (repo.secondary) {
				secondary = document.createElement('a');
				var href = repo.secondary.urlPattern.replace(/\${gitSha}/, hash);
				secondary.href = href;
				secondary.setAttribute('aria-label', repo.secondary.buttonText);
				secondary.className = 'minibutton tooltipped tooltipped-s uiPreviewer';
				secondary.innerHTML = '<span class="octicon octicon-' + repo.secondary.icon + '"></span> ';
				secondary.style.float = 'right';
				secondary.style.marginTop = '-0.4em';
				secondary.style.marginRight = '0.4em';
				secondary.target = '_blank';
				parent.insertBefore(secondary, link);
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
