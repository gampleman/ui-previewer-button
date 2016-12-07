var prefix = 'uiPreviewerButtonOptions';
var form = document.getElementById('options_form');

var currentIconField, currentIconPreview;

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
  var button = document.createElement('button');
  button.innerText = 'Share';
  button.addEventListener('click', function(e) {
    document.getElementById('export-text').value = '### [UI Previewer Button](https://rightscale.github.io/ui-previewer-button/) config\n\n```json\n' + JSON.stringify(getRepoConfig(div), null, 2) + '\n```';
    document.getElementById('export-modal').style.display = 'block';
    e.preventDefault();
  });
  button.className = 'share-btn';
  div.appendChild(button);
  return div;
};

function exportModal() {
  var div = document.createElement('div');
  div.className = 'popup';
  div.id = 'export-modal';
  div.innerHTML = '<h3>Auto-configuration snippet</h3><p>Paste this snippet into your README.md and anyone else with this extension installed will have it configured automatically.</p><p><textarea id="export-text"></textarea></p>';
  var cancel = document.createElement('button');
  cancel.innerText = 'Cancel';
  cancel.addEventListener('click', function() {
    div.style.display = 'none';
  });
  div.appendChild(cancel);
  return div;
}

function octiconHelp() {

  var div = document.createElement('div');
  div.className = 'popup';
  div.id = 'icon-help-popup';
  for (var iconName in window.icons) {
    if (window.icons.hasOwnProperty(iconName)) {
      (function(icon) {
        var link = document.createElement('a');
        link.href = '#';
        link.className = 'icon';
        link.innerHTML = icon;
        link.addEventListener('click', function() {
          currentIconField.value = icon;
          currentIconPreview.innerHTML = icon;
          div.style.display = 'none';
        });
        div.appendChild(link);
      })(window.icons[iconName]);
    }
  }
  var textarea = document.createElement('textarea');
  textarea.setAttribute('placeholder', 'Or paste your custom 16x16 SVG here...');
  div.appendChild(textarea);
  var useTextarea = document.createElement('button');
  useTextarea.innerText = 'Use Custom SVG';
  useTextarea.addEventListener('click', function() {
    var icon = textarea.value;
    currentIconField.value = icon;
    currentIconPreview.innerHTML = icon;
    div.style.display = 'none';
  });
  div.appendChild(useTextarea);
  var cancel = document.createElement('button');
  cancel.innerText = 'Cancel';
  cancel.addEventListener('click', function() {
    div.style.display = 'none';
  });
  div.appendChild(cancel);
  return div;
}

function urlPattern(div, button) {
  return '<p><label>Url Pattern: <input type="text" class="pattern" value="' + button.urlPattern + '" /></label></p>' +
  '<p>You can use <code>${gitSha}</code> where you want the sha of the commit to appear.</p>';
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
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
  if (!button.icon.match(/^\s*<\??(svg|xml|doctype)/i)) {
    button.icon = window.icons.bug;
  }
  out += '<p><label>Icon: <input type="hidden" class="icon" value="' + escapeHtml(button.icon) + '" /><span class="icon-preview">' + button.icon + '</preview></label></p>';
  out += '<p><label>Label:</label> <input type="text" class="button-text" placeholder="Optional" value="' + (button.buttonText ? button.buttonText : '') + '" /></p>';
  div.innerHTML = out;
  div.querySelector('input[type=checkbox]').addEventListener('change', function() {
    if (div.querySelector('input[type=checkbox]').checked) {
      div.classList.remove('disabled');
    } else {
      div.classList.add('disabled');
    }
  });
  var iconLink = document.createElement('button');
  iconLink.innerText = 'Select...';
  iconLink.addEventListener('click', function(e) {
    document.getElementById('icon-help-popup').style.display = 'block';
    currentIconField = div.querySelector('.icon');
    currentIconPreview = div.querySelector('.icon-preview');
    e.preventDefault();
  });
  iconLink.href = '#';
  var selection = div.querySelectorAll('p');
  selection[selection.length - 2].appendChild(iconLink);
  return div;
}

function getRepoConfig(repo) {
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
  return data;
}

function save() {
  var settings = {};
  var repos = form.querySelectorAll('.repo');
  for(var i = 0, l = repos.length; i < l; i++) {
    var repo = repos[i];

    settings[repoName] = getRepoConfig(repo);
  }
  setConfig({repos: settings});
}

function getButton(button) {
  var buttonText = button.querySelector('.button-text').value;
  var obj = {
    urlPattern: button.querySelector('.pattern').value,
    icon: button.querySelector('.icon').value,
    buttonText: buttonText === '' ? null : buttonText
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
    buttonText: null,
    icon: ''
  }}));
});
document.body.appendChild(octiconHelp());
document.body.appendChild(exportModal());
