window.addEventListener('load', function() {
	var parent = document.querySelector('.branch-status');
	var successfulCommits = document.querySelectorAll('.status-success + code>.commit-id');
	if (successfulCommits) {
		var hash = successfulCommits[successfulCommits.length - 1].href.match(/[a-z\d]{40}/i)[0];
		var link = document.createElement('a');
		link.href = "https://analytics.rightscale.com/?scout=https://analytics-ui-assets-production.s3.amazonaws.com/" + hash + '/'; // fix me
		link.className = 'minibutton';
		link.innerHTML = '<span class="octicon octicon-eye"></span> Preview UI';
		link.style.float = 'right';
		link.style.marginTop = '-0.4em';
		link.style.marginRight = '0.4em';
		link.target = '_blank';
		parent.insertBefore(link, parent.firstChild);
	}
});
