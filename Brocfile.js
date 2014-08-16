var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');
var jshintTree = require('broccoli-jshint');
var uglifyJavaScript = require('broccoli-uglify-js');
var concat = require('broccoli-concat');
var broccoli = require('broccoli');

//JSHint node server js
var server = 'server';
server = jshintTree(server);

var builder = new broccoli.Builder(server);
builder.build();

//JSHint client side js
var src = 'src';
src = jshintTree(src);

builder = new broccoli.Builder(src);
builder.build();

//Uglify client side js
//except for jsmpeg becuase it cannot be uglified
var uglyJs = uglifyJavaScript('src');

var vendor = 'vendor';
var sourceTrees = [vendor,uglyJs];

//Merge vender and src js trees
var appAndDependencies = new mergeTrees(sourceTrees, { overwrite: true });

//Concat vender and src js files into single file
var appJs = concat(appAndDependencies, {
  inputFiles: ['*.js'],
  outputFile: '/index.js',
});


module.exports = appJs;
