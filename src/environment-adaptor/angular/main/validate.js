angular.module('validation').directive('validate', ['validator', function(validator) {
	return {
		restrict: 'A',
		scope: false,
		controller: 'ValidateController',
		require: ['validate', 'ngModel'],
		link: function(scope, elem, attrs, ctrls) {
			var validate = ctrls[0], ngModel = ctrls[1];
			validate.configure(ngModel, validator);
			if( typeof(attrs.validateNoWatch) === 'undefined' ) {
				validate.watchValidity();
			}
		}
	};
}]);
