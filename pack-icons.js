#! /usr/bin/env node
var args = process.argv.slice(2),
    path = require('path'),
    fs   = require('fs');

var result = {};
args.forEach(function(arg) {
  var name = path.basename(arg, '.svg'),
      contents = fs.readFileSync(arg, 'utf8');
  result[name] = contents;
});

console.log('window.icons = ' + JSON.stringify(result, null, 2) + ';\n');
