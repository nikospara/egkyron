module.exports = function(config) {
	config.set({
		browsers: ['PhantomJS'],
		frameworks: ['jasmine'],
		files: [
			'main/**/*.js',
			'test/**/*.spec.js'
		]
	});
};
