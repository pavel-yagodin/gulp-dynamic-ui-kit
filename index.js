'use strict';

var _ = require('lodash');
var path = require('path');
var gutil = require('gulp-util');
var GulpError = gutil.PluginError;
var warn = gutil.colors.yellow;
var grey = gutil.colors.grey;
var through = require('through2');
var BPromise= require('bluebird');
var defaults = require('./config/default');
var templates = require('./lib/templates.js');
var read = require('read-file');

var templatesPath = {
	'jade':	path.join(__dirname, './templates/ui-kit.jade'),
};

function gulpUiKit(opts) {
	opts = opts || {};
	var buffer = [];
	var options = _.defaults(_.cloneDeep(opts), _.cloneDeep(defaults));
	options.templates = options.templates.map(function (pathName) {
		if (pathName in templatesPath) return templatesPath[pathName];
		return pathName;
	});
	return through.obj(function transform(file, encoding, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}
		if (file.isStream()) {
			this.emit('error', new GulpError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}
		buffer.push(JSON.parse(file.contents.toString()));
		return cb(null);
	}, function flush(cb) {
		var that = this;
		var files = templates.renderAll(options.templates, {items: buffer});
		function outputFiles(files) {
			files.forEach(function (file) {
				that.push(file);
			});
			cb();
		}
		BPromise.all(files).then(outputFiles);
	});
}

module.exports = gulpUiKit;
