angular.module('validation').directive('validate', function() {
	return {
		restrict: 'A',
		scope: false,
		controller: 'ValidateController',
		require: ['validate', 'ngModel'],
		link: function(scope, elem, attrs, ctrls) {
			var validate = ctrls[0], ngModel = ctrls[1];
			validate.setNgModel(ngModel);
			if( typeof(attrs.validateNoWatch) === 'undefined' ) {
				validate.watchValidity();
			}
		}
	};
});
