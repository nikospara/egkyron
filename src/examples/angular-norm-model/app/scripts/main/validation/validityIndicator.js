angular.module('validation').directive('validityIndicator', function() {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'scripts/main/validation/validityIndicator.tpl.html',
		controllerAs: 'ctrl',
		controller: ['$scope', '$element', function($scope, $element) {
			var validityCoordinator;

			function setValidityCoordinator(validityCoordinatorValue) {
				this.validityCoordinator = validityCoordinatorValue;
			}

			angular.extend(this, {
				validityCoordinator: null,
				setValidityCoordinator: setValidityCoordinator
			})
		}],
		require: ['validityIndicator', '^validityCoordinator'],
		link: function(scope, elem, attrs, ctrls) {
			var validityIndicator = ctrls[0], validityCoordinator = ctrls[1];
			validityIndicator.setValidityCoordinator(validityCoordinator);
		}
	};
});
