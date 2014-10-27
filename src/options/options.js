var prefix = 'uiPreviewerOptions';
var form = document.getElementById('options_form');

var options;

function createUI() {
  for (name in options.repos) {
    form.appendChild(generateRow(name, options.repos[name]));
  }
};

function generateRow(name, repo) {
  var div = document.createElement('div');
  div.className = 'repo';
  var source = '';
  source += '<label><b>Repo:</b> <input type="text" class="repo-name" value="' + name + '" /></label>';
  source += '<h3>Primary button</h3>';
  source += '<div class="primary-button">';
  source += generateButton(repo.mainButton);
  source += '</div>';
  source += '<div class="secondary-button">';
  source += '<h3>Secondary button</h3>';
  source += '<label><input type="checkbox" ' + (repo.secondary ? 'checked' : '') + '/>Enabled</label>';
  source += generateButton(repo.secondary || {
    urlPattern: '',
    buttonText: '',
    icon: ''
  });
  source += '</div>';
  div.innerHTML = source;
  var a = document.createElement('a');
  a.innerText = 'Remove';
  a.addEventListener('click', function(e) {
    form.removeChild(div);
    e.preventDefault();
  });
  a.href = '#';
  div.appendChild(a);
  return div;
};

function generateButton(button) {
  var out = '';
  out += '<p><label>Url Pattern: <input type="text" class="pattern" value="' + button.urlPattern + '" /></label></p>';
  out += '<p>You can use <code>${gitSha}</code> where you want the sha of the commit to appear.</p>';
  out += '<p><label>Label: <input type="text" class="label" value="' + button.buttonText + '" /></label></p>';
  out += '<p><label>Icon: <input type="text" class="icon" value="' + button.icon + '" /></label></p>';
  return out;
}

function save() {
  var settings = {};
  var repos = form.querySelectorAll('.repo');
  for(var i = 0, l = repos.length; i < l; i++) {
    var repo = repos[i];
    var repoName = repo.querySelector('.repo-name').value;
    var data = {};
    data.mainButton = getButton(repo.querySelector('.primary-button'));
    if (repo.querySelector('.secondary-button input[type=checkbox]').checked) {
      data.secondary = getButton(repo.querySelector('.secondary-button'));
    }
    settings[repoName] = data;
  }
  localStorage[prefix] = JSON.stringify({'repos' : settings});
}

function getButton(button) {
  return {
    urlPattern: button.querySelector('.pattern').value,
    buttonText: button.querySelector('.label').value,
    icon: button.querySelector('.icon').value
  };
}

chrome.runtime.sendMessage({gimme: 'gimme'}, function(req) {
  options = req;
  createUI();
});

document.getElementById('save').addEventListener('click', save);
document.getElementById('add').addEventListener('click', function() {
  form.appendChild(generateRow( '', {mainButton: {
    urlPattern: '',
    buttonText: '',
    icon: ''
  }}));
});
