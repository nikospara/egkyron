var gulp = require('gulp');

gulp.task('core.jshint', function() {
	var jshint = require('gulp-jshint');

	return gulp
		.src('./src/core/main/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('core.jsdoc', ['core.jshint'], function() {
	var jsdoc = require('gulp-jsdoc');

	return gulp
		.src('./src/core/main/**/*.js')
		.pipe(jsdoc('./target/docs/core'));
});

gulp.task('core.test', ['core.jshint', 'core.package.node'], function() {
	var
		jshint = require('gulp-jshint'),
		jasmine = require('gulp-jasmine');

	return gulp
		.src('./src/core/test/**/*.spec.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.pipe(jasmine({includeStackTrace: true}));
});

gulp.task('core.package.node', ['core.jshint'], function() {
	var
		tap = require('gulp-tap'),
		affix = require('./src/build/gulp-affix.js');

	return gulp
		.src('./src/core/main/**/*.js')
		.pipe(tap(affix('./src/packaging/node/')))
		.pipe(gulp.dest('./target/dist/node'));
});



gulp.task('intstrat.jshint', function() {
	var jshint = require('gulp-jshint');

	return gulp
		.src('./src/introspection-strategy/main/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('intstrat.jsdoc', ['intstrat.jshint'], function() {
	var jsdoc = require('gulp-jsdoc');

	return gulp
		.src('./src/introspection-strategy/main/**/*.js')
		.pipe(jsdoc('./target/docs/introspection-strategy'));
});

gulp.task('intstrat.test', ['intstrat.jshint', 'intstrat.package.node'], function() {
	var
		jshint = require('gulp-jshint'),
		jasmine = require('gulp-jasmine');

	return gulp
		.src('./src/introspection-strategy/test/**/*.spec.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.pipe(jasmine({includeStackTrace: true}));
});

gulp.task('intstrat.package.node', ['intstrat.jshint'], function() {
	var
		tap = require('gulp-tap'),
		affix = require('./src/build/gulp-affix.js');

	return gulp
		.src('./src/introspection-strategy/main/**/*.js')
		.pipe(tap(affix('./src/packaging/node/introspection-strategy/')))
		.pipe(gulp.dest('./target/dist/node/introspection-strategy'));
});
