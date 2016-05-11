var gulp = require('gulp');


gulp.task('default', ['core.test', 'core.package.angular', 'intstrat.test', 'intstrat.package.angular', 'envadaptor.test', 'envadaptor.package.angular', 'bower.angular']);



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
		.src(['./src/core/README.md', './src/core/main/**/*.js'])
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
		affix = require('./src/build/gulp-affix.js'),
		merge2 = require('merge2');

	return merge2(
			gulp
				.src('./src/core/main/**/*.js')
				.pipe(tap(affix('./src/packaging/node/affixes/'))),
			gulp
				.src(['./package.json', './LICENSE', './README.md', './src/packaging/node/index.js'])
		)
		.pipe(gulp.dest('./target/dist/node'));
});

gulp.task('core.package.angular', ['core.jshint'], function() {
	var
		tap = require('gulp-tap'),
		affix = require('./src/build/gulp-affix.js');

	return gulp
		.src('./src/core/main/**/*.js')
		.pipe(tap(affix('./src/packaging/angular/affixes/')))
		.pipe(gulp.dest('./target/dist/angular'));
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
		.pipe(tap(affix('./src/packaging/node/affixes/introspection-strategy/')))
		.pipe(gulp.dest('./target/dist/node/introspection-strategy'));
});

gulp.task('intstrat.package.angular', ['intstrat.jshint'], function() {
	var
		tap = require('gulp-tap'),
		affix = require('./src/build/gulp-affix.js');

	return gulp
		.src('./src/introspection-strategy/main/**/*.js')
		.pipe(tap(affix('./src/packaging/angular/affixes/introspection-strategy/')))
		.pipe(gulp.dest('./target/dist/angular/introspection-strategy'));
});



gulp.task('envadaptor.jshint', function() {
	var jshint = require('gulp-jshint');

	return gulp
		.src('./src/environment-adaptor/*/main/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('envadaptor.test.jshint', function() {
	var jshint = require('gulp-jshint');

	return gulp
		.src('./src/environment-adaptor/*/test/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('envadaptor.package.angular', function() {
	return gulp
		.src('./src/environment-adaptor/angular/main/**/*.js')
		.pipe(gulp.dest('./target/dist/angular'));
});

gulp.task('envadaptor.test', ['envadaptor.jshint', 'envadaptor.test.jshint', 'envadaptor.package.angular', 'core.package.angular'], function(done) {
	var KarmaServer = require('karma').Server;

	var server = new KarmaServer({
		configFile: __dirname + '/src/environment-adaptor/angular/karma.conf.js',
		singleRun: true
	}, done);

	server.start();
});



gulp.task('bower.angular.sources', ['core.package.angular', 'envadaptor.package.angular', 'intstrat.package.angular'], function() {
	var
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		rename = require('gulp-rename'),
		merge2 = require('merge2');

	return merge2(
			gulp
				.src(['./target/dist/angular/*.module.js', './target/dist/angular/*.js'])
				.pipe(concat('egkyron-core.js'))
				.pipe(gulp.dest('./target/dist/bower-egkyron-core-angular'))
				.pipe(uglify())
				.pipe(rename('egkyron-core.min.js')),
			gulp
				.src('./src/packaging/angular/bower-core.json')
				.pipe(rename('bower.json'))
		)
		.pipe(gulp.dest('./target/dist/bower-egkyron-core-angular'));
});

gulp.task('bower.angular', ['bower.angular.sources']);



gulp.task('ngdoc', ['core.package.angular', 'intstrat.package.angular', 'envadaptor.package.angular'], function() {
	var gulpDocs = require('gulp-ngdocs');
	return gulp.src(['./src/environment-adaptor/angular/main/*.js', './target/dist/angular/**/*.js'])
		.pipe(gulpDocs.process())
		.pipe(gulp.dest('./target/docs/environment-adaptor/angular'));
});

gulp.task('ngdoc.serve', ['ngdoc'], function() {
	var
		express = require('express'),
		app = express();

	app.use(express.static('target/docs/environment-adaptor/angular'));
	app.listen(8000);
});
