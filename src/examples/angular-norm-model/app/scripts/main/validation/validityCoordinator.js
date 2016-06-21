angular.module('validation').directive('validityCoordinator', function() {
	return {
		restrict: 'A',
		scope: false,
		controller: ['$element', function($element) {
			this.isValid = null;
			this.errorState = {};

			this.setValid = function(isValid) {
				this.isValid = isValid;
				$element.toggleClass('has-error', !isValid);
			};

			this.handleMessage = function(validatorKey, validationResult) {
				if( validationResult.isValid ) {
					delete this.errorState[validatorKey];
				}
				else {
					this.errorState[validatorKey] = validationResult.message || validatorKey;
				}
			};
		}]
	};
});
