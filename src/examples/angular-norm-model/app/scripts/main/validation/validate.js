angular.module('validation').directive('validate', function() {
	return {
		restrict: 'A',
		priority: 10,
		scope: false,
		controller: 'ValidateController',
		require: ['validate', 'ngModel', '?^validityCoordinator', '?^^validate', '^validator'],
		compile: function() {
			return {
				// We depend on our parent controller to get the type _AND_ pass it to our
				// descendants, so we work in a pre-link function.
				pre: function(scope, elem, attrs, ctrls) {
					var
						validate = ctrls[0],
						ngModel = ctrls[1],
						validityCoordinator = ctrls[2],
						parentValidate = ctrls[3],
						validator = ctrls[4].getValidator();

					validate.configure(ngModel, validator, parentValidate);

					if( typeof(attrs.validateNoWatch) === 'undefined' ) {
						validate.watchValidity();
					}

					if( validityCoordinator ) {
						validate.handleMessage = function(validatorKey, validationResult) {
							validityCoordinator.handleMessage(validatorKey, validationResult);
						};

						scope.$watch(
							function() {
								return ngModel.$valid;
							},
							function(newval) {
								validityCoordinator.setValid(newval);
							}
						);
					}
				}
			};
		}
	};
});
