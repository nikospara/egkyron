/**
 * @ngdoc directive
 * @name egkyron.directive:validator
 * @function
 *
 * @description
 * Specify the validator to be used for all the child elements.
 *
 */
angular.module('egkyron').directive('validator', function() {
	return {
		restrict: 'A',
		scope: false,
		controller: ['$scope', '$parse', '$attrs', function($scope, $parse, $attrs) {
			var validator = $parse($attrs.validator)($scope);

			this.getValidator = function() {
				return validator;
			};
		}]
	};
});
