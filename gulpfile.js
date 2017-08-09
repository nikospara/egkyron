var gulp = require('gulp');


gulp.task('default', [
	'combined.test',
	'core.package.angular',
	'core.package.browser',
	'intstrat.package.angular',
	'intstrat.package.browser',
	'envadaptor.test',
	'envadaptor.package.angular',
	'envadaptor.package.angular-browser',
	'bower.angular'
]);



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

gulp.task('core.package.browser', ['core.jshint'], function() {
	var concat = require('gulp-concat');
	var uglify = require('gulp-uglify');
	var rename = require('gulp-rename');
	var tap = require('gulp-tap');
	var affix = require('./src/build/gulp-affix.js');

	return gulp
		.src('./src/core/main/**/*.js')
		.pipe(concat('egkyron-core.js'))
		.pipe(tap(affix('./src/packaging/browser/affixes/')))
		.pipe(gulp.dest('./target/dist/browser'))
		.pipe(uglify())
		.pipe(rename('egkyron-core.min.js'))
		.pipe(gulp.dest('./target/dist/browser'))
	;
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

gulp.task('intstrat.package.browser', ['intstrat.jshint'], function() {
	var concat = require('gulp-concat');
	var uglify = require('gulp-uglify');
	var rename = require('gulp-rename');
	var tap = require('gulp-tap');
	var affix = require('./src/build/gulp-affix.js');

	return gulp
		.src('./src/introspection-strategy/main/**/*.js')
		.pipe(concat('egkyron-introspection-strategy.js'))
		.pipe(tap(affix('./src/packaging/browser/affixes/introspection-strategy/')))
		.pipe(gulp.dest('./target/dist/browser'))
		.pipe(uglify())
		.pipe(rename('egkyron-introspection-strategy.min.js'))
		.pipe(gulp.dest('./target/dist/browser'))
	;
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

gulp.task('envadaptor.package.angular-browser', ['envadaptor.package.angular'], function() {
	var concat = require('gulp-concat');
	var uglify = require('gulp-uglify');
	var rename = require('gulp-rename');
	var tap = require('gulp-tap');
	var affix = require('./src/build/gulp-affix.js');

	return gulp
		.src(['./target/dist/angular/egkyron.module.js', './target/dist/angular/**/*.js'])
		.pipe(concat('egkyron-angular.js'))
		.pipe(gulp.dest('./target/dist/browser'))
		.pipe(uglify())
		.pipe(rename('egkyron-angular.min.js'))
		.pipe(gulp.dest('./target/dist/browser'))
	;
});

gulp.task('envadaptor.test', ['envadaptor.jshint', 'envadaptor.test.jshint', 'envadaptor.package.angular', 'core.package.angular'], function(done) {
	var KarmaServer = require('karma').Server;

	var server = new KarmaServer(
		{
			configFile: __dirname + '/src/environment-adaptor/angular/karma.conf.js',
			singleRun: true
		},
		function(result) {
			// see https://github.com/karma-runner/gulp-karma/issues/30
			// thanks to Charis Kalligeros
			if( result > 0 ) {
				return done(new Error('Karma exited with status code ' + result));
			}
			done();
		}
	);

	server.start();
});



// It seems that running two test suites in parallel creates synchronization problems,
// i.e. one suite reporting problems when there are none when it runs alone.
// This is a workaround.
gulp.task('combined.test', ['core.jshint', 'core.package.node', 'intstrat.jshint', 'intstrat.package.node'], function() {
	var
		jshint = require('gulp-jshint'),
		jasmine = require('gulp-jasmine');

	return gulp
		.src(['./src/core/test/**/*.spec.js', './src/introspection-strategy/test/**/*.spec.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.pipe(jasmine({includeStackTrace: true}));
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
