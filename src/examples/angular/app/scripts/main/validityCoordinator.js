angular.module('validation').directive('validityCoordinator', function() {
	return {
		restrict: 'A',
		scope: false,
		controller: ['$element', function($element) {
			this.setValid = function(isValid) {
				$element.toggleClass('has-error', !isValid);
			};
		}]
	};
});
