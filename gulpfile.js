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

gulp.task('core.test', ['core.jshint', 'core.package'], function() {
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
		.pipe(gulp.dest('./target/dist/core/node'));
});


gulp.task('constrat.jshint', function() {
	var jshint = require('gulp-jshint');

	return gulp
		.src('./src/constraints-strategy/main/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('constrat.jsdoc', ['constrat.jshint'], function() {
	var jsdoc = require('gulp-jsdoc');

	return gulp
		.src('./src/constraints-strategy/main/**/*.js')
		.pipe(jsdoc('./target/docs/constraints-strategy'));
});

gulp.task('constrat.package.node', ['constrat.jshint'], function() {
	var
		tap = require('gulp-tap'),
		affix = require('./src/build/gulp-affix.js');

	return gulp
		.src('./src/constraints-strategy/main/**/*.js')
		.pipe(tap(affix('./src/packaging/node/constraints-strategy/')))
		.pipe(gulp.dest('./target/dist/core/node/constraints-strategy'));
});
