var gulp = require('gulp');

gulp.task('default', ['package.node', 'package.angular'], function() {
	var app = require('./app');
	app.listen(4000);
});

gulp.task('package.node', function() {
	var
		tap = require('gulp-tap'),
		affix = require('../../../src/build/gulp-affix');

	return gulp
		.src('./shared/**/*.js')
		.pipe(tap(affix('./packaging/node/')))
		.pipe(gulp.dest('./target/node/shared'));
});

gulp.task('package.angular', function() {
	var
		tap = require('gulp-tap'),
		affix = require('../../../src/build/gulp-affix');

	return gulp
		.src('./shared/**/*.js')
		.pipe(tap(affix('./packaging/angular/')))
		.pipe(gulp.dest('./target/web/shared'));
});
