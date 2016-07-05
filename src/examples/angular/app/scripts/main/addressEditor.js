angular.module('app').directive('addressEditor', ['Address', function(Address) {
	return {
		restrict: 'E',
		templateUrl: 'scripts/main/addressEditor.tpl.html',
		scope: {
			label: '@'
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function() {
			// NOP
		},
		require: ['addressEditor', 'ngModel'],
		link: function(scope, elem, attrs, ctrls) {
			var addressEditor = ctrls[0], ngModel = ctrls[1];

			ngModel.$render = function() {
				addressEditor.address = ngModel.$viewValue || new Address();
			};

			scope.$watchCollection(
				function() {
					return addressEditor.address;
				},
				function(newval, oldval) {
					ngModel.$setViewValue(newval);
				}
			);
		}
	};
}]);
