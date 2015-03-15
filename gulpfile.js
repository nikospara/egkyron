var gulp = require('gulp');

gulp.task('jshint', function() {
	var jshint = require('gulp-jshint');

	return gulp
		.src('./src/core/main/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('jsdoc', ['jshint'], function() {
	var jsdoc = require('gulp-jsdoc');

	return gulp
		.src('./src/core/main/**/*.js')
		.pipe(jsdoc('./target/docs/core'));
});

gulp.task('test', ['jshint', 'package'], function() {
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

gulp.task('package', function() {
	var
		tap = require('gulp-tap'),
		affix = require('./src/build/gulp-affix.js');

	return gulp
		.src('./src/core/main/**/*.js')
		.pipe(tap(affix('./src/packaging/node/')))
		.pipe(gulp.dest('./target/dist/core/node'));
});
