'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var rename = require("gulp-rename");

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

var environment = process.env.ENV || 'dev';

gulp.task('copy', function() {
  gulp.src(path.join(conf.paths.envfile, '/index.module_'+environment+'.js'))
	.pipe(rename('index.module.js'))
	.pipe(gulp.dest(path.join(conf.paths.src, '/app/')));
  gulp.src(path.join(conf.paths.envfile, '/index.run_'+environment+'.js'))
	.pipe(rename('index.run.js'))
	.pipe(gulp.dest(path.join(conf.paths.src, '/app/')));
});

gulp.task('scripts-reload', function() {
  return buildScripts()
    .pipe(browserSync.stream());
});

gulp.task('scripts', ['copy'], function() {
  return buildScripts();
});

function buildScripts() {
  return gulp.src(path.join(conf.paths.src, '/app/**/*.js'))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.size())
};
