angular.module('validation').directive('validate', ['validator', function(validator) {
	return {
		restrict: 'A',
		scope: false,
		controller: 'ValidateController',
		require: ['validate', 'ngModel', '?^validityCoordinator'],
		link: function(scope, elem, attrs, ctrls) {
			var validate = ctrls[0], ngModel = ctrls[1], validityCoordinator = ctrls[2];

			validate.configure(ngModel, validator);

			if( typeof(attrs.validateNoWatch) === 'undefined' ) {
				validate.watchValidity();
			}

			if( validityCoordinator ) {
				scope.$watch(
					function() {
						return ngModel.$valid;
					},
					validityCoordinator.setValid
				);
			}
		}
	};
}]);
