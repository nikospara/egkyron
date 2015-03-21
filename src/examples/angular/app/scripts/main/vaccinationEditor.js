angular.module('app').directive('vaccinationEditor', function() {
	return {
		restrict: 'E',
		templateUrl: 'scripts/main/vaccinationEditor.tpl.html',
		scope: {
			index: '=',
			removeItem: '&'
		},
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function() {
			
		},
		require: ['vaccinationEditor', 'ngModel'],
		link: function(scope, elem, attrs, ctrls) {
			var vaccinationEditor = ctrls[0], ngModel = ctrls[1];
			
			ngModel.$render = function() {
				vaccinationEditor.vaccination = ngModel.$viewValue;
			};
		}
	};
});
