var prefix = 'uiPreviewerButtonOptions';
var form = document.getElementById('options_form');

var currentIconField;

var options = JSON.parse(localStorage[prefix] || '{"repos": {}}');

function setConfig(settings) {
  if (PLATFORM === 'chrome' || PLATFORM === 'firefox') {
    localStorage[prefix] = JSON.stringify(settings);
  } else if (PLATFORM === 'safari') {
    safari.self.tab.dispatchMessage('setUiPreviewerButtonConfig', settings);
  }
}

function createUI() {
  for (name in options.repos) {
    form.appendChild(generateRow(name, options.repos[name]));
  }
};

function generateRow(name, repo) {
  var div = document.createElement('div');
  div.className = 'repo';
  var source = '';
  source += '<label><b>GitHub Repo:</b> <input type="text" class="repo-name" value="' + name + '" /></label>';
  source += '<p>Where will these buttons be active on? This can be a wildcard pattern, i.e. <code>angular/*</code></p>';
  div.innerHTML = source;

  div.appendChild(generateButton(repo.mainButton, 'Primary Status Button', 'The primary status button appears as a large button in the \'Merge\' area of the PR and next to any green status circles (as an icon only).', 'primary-button', urlPattern));

  div.appendChild(generateButton(repo.secondary, 'Secondary Status Button', 'The secondary status button appears only as a large button in the \'Merge\' area of the PR.', 'secondary-button', urlPattern));

  div.appendChild(generateButton(repo.branch, 'Branch Button', 'The branch button is used for the common use case where the branch contains information you can use. The button will apear next to the branch name.', 'branch-button', function(div, button) {
    var out = '';
    out += '<p><label>Pattern: <input class="general-pattern" type="text" value="'+ button.pattern + '" /></label></p>';
    out += '<p><label>Url: <input class="pattern" type="text" value="'+ button.urlPattern + '" /></label></p>';
    out += '<p>The <b>Pattern</b> is a RegExp and will be matched against the branch name. Matched groups 0-9 can be used in the URL to get parts of the branch. To get the whole branch name, simply use <code>.*</code for the pattern and <code>$0</code> in the URL.</p>';
    return out;
  }));
  var a = document.createElement('a');
  a.innerText = 'Remove';
  a.addEventListener('click', function(e) {
    if (confirm('Are you sure you want to delete this repo?')) {
      form.removeChild(div);
    }
    e.preventDefault();
  });
  a.href = '#';
  a.className = 'remove';
  div.appendChild(a);
  return div;
};

function octiconHelp() {
  var icons = ["alert","alignment-align","alignment-aligned-to","alignment-unalign","arrow-down","arrow-left","arrow-right","arrow-small-down","arrow-small-left","arrow-small-right","arrow-small-up","arrow-up","beer","book","bookmark","briefcase","broadcast","browser","bug","calendar","check","checklist","chevron-down",
  "chevron-left","chevron-right","chevron-up","circle-slash","circuit-board","clippy","clock","cloud-download","cloud-upload","code","color-mode","comment","comment-discussion","credit-card","dash","dashboard","database","device-camera","device-camera-video","device-desktop","device-mobile","diff","diff-added","diff-ignored","diff-modified",
  "diff-removed","diff-renamed","ellipsis","eye","file-binary","file-code","file-directory","file-media","file-pdf","file-submodule","file-symlink-directory","file-symlink-file","file-text","file-zip","flame","fold","gear","gift","gist","gist-secret","git-branch","git-commit","git-compare","git-merge","git-pull-request",
  "globe","graph","heart","history","home","horizontal-rule","hourglass","hubot","inbox","info","issue-closed","issue-opened","issue-reopened","jersey","jump-down","jump-left","jump-right","jump-up","key","keyboard","law","light-bulb","link","link-external","list-ordered",
  "list-unordered","location","lock","mail","mail-read","mail-reply","mark-github","markdown","megaphone","mention","microscope","milestone","mirror","mortar-board","move-down","move-left","move-right","move-up","mute","no-newline","octoface","organization","package","paintcan",
  "pencil","person","pin","playback-fast-forward","playback-pause","playback-play","playback-rewind","plug","plus","podium","primitive-dot","primitive-square","pulse","puzzle","question","quote","radio-tower","repo","repo-clone","repo-force-push","repo-forked","repo-pull","repo-push","rocket","rss",
  "ruby","screen-full","screen-normal","search","server","settings","sign-in","sign-out","split","squirrel","star","steps","stop","sync","tag","telescope","terminal","three-bars","tools","trashcan","triangle-down","triangle-left","triangle-right","triangle-up","unfold",
  "unmute","versions","x","zap"];

  var div = document.createElement('div');
  div.className = 'popup';
  div.id = 'icon-help-popup';
  icons.forEach(function(icon) {
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'icon';
    link.innerHTML = '<span class="octicon octicon-' + icon + '"></span>';
    link.addEventListener('click', function() {
      currentIconField.value = icon;
      div.style.display = 'none';
    });
    div.appendChild(link);
  });

  return div;
}

function urlPattern(div, button) {
  return '<p><label>Url Pattern: <input type="text" class="pattern" value="' + button.urlPattern + '" /></label></p>' +
  '<p>You can use <code>${gitSha}</code> where you want the sha of the commit to appear.</p>';
}

function generateButton(button, title, help, className, cb) {
  var div = document.createElement('div');
  div.classList.add('button-section');
  div.classList.add(className);
  var out = '';
  out += '<h3>' + title + '</h3>';
  out += '<p>' + help + '</p>';
  out += '<label style="color: black"><input type="checkbox" ' + (button ? 'checked' : '') + '/>Enabled</label>';
  if (!button) {
    button = {
      urlPattern: '',
      icon: '',
      pattern: '.*'
    }
    div.classList.add('disabled');
  }
  out += cb(div, button, className);
  out += '<p><label>Icon: <input type="text" class="icon" value="' + button.icon + '" /></label></p>';
  div.innerHTML = out;
  div.querySelector('input[type=checkbox]').addEventListener('change', function() {
    if (div.querySelector('input[type=checkbox]').checked) {
      div.classList.remove('disabled');
    } else {
      div.classList.add('disabled');
    }
  });
  var iconLink = document.createElement('a');
  iconLink.innerText = 'Select';
  iconLink.addEventListener('click', function(e) {
    document.getElementById('icon-help-popup').style.display = 'block';
    currentIconField = div.querySelector('.icon');
    e.preventDefault();
  });
  iconLink.href = '#';
  var selection = div.querySelectorAll('p');
  selection[selection.length - 1].appendChild(iconLink);
  return div;
}

function save() {
  var settings = {};
  var repos = form.querySelectorAll('.repo');
  for(var i = 0, l = repos.length; i < l; i++) {
    var repo = repos[i];
    var repoName = repo.querySelector('.repo-name').value;
    var data = {};
    if (repo.querySelector('.primary-button input[type=checkbox]').checked) {
      data.mainButton = getButton(repo.querySelector('.primary-button'));
    }
    if (repo.querySelector('.secondary-button input[type=checkbox]').checked) {
      data.secondary = getButton(repo.querySelector('.secondary-button'));
    }
    if (repo.querySelector('.branch-button input[type=checkbox]').checked) {
      data.branch = getButton(repo.querySelector('.branch-button'));
    }
    settings[repoName] = data;
  }
  setConfig({repos: settings});
}

function getButton(button) {
  var obj = {
    urlPattern: button.querySelector('.pattern').value,
    icon: button.querySelector('.icon').value
  };
  if (button.querySelector('.general-pattern')) {
    obj.pattern = button.querySelector('.general-pattern').value;
  }
  return obj;
}


createUI();

document.getElementById('save').addEventListener('click', save);
document.getElementById('add').addEventListener('click', function() {
  form.appendChild(generateRow( '', {mainButton: {
    urlPattern: '',
    buttonText: '',
    icon: ''
  }}));
});
document.body.appendChild(octiconHelp());
