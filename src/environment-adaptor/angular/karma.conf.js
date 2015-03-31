module.exports = function(config) {
	config.set({
		browsers: ['PhantomJS'],
		frameworks: ['jasmine'],
		files: [
			'../../../bower_components/angular/angular.js',
			'../../../bower_components/angular-mocks/angular-mocks.js',
			'../../../target/dist/angular/**/*.module.js',
			'../../../target/dist/angular/**/*.js',
			'test/**/*.spec.js'
		]
	});
};
