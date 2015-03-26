angular.module('validation').directive('validate', ['validator', function(validator) {
	return {
		restrict: 'A',
		priority: 10,
		scope: false,
		controller: 'ValidateController',
		require: ['validate', 'ngModel', '?^validityCoordinator', '?^^validate'],
		compile: function() {
			return {
				pre: function(scope, elem, attrs, ctrls) {
					var
						validate = ctrls[0],
						ngModel = ctrls[1],
						validityCoordinator = ctrls[2],
						parentValidate = ctrls[3],
						type = null,
						childType = null,
						propName = null;

					(function() {
						var processedModelExpression = validate.configure(ngModel, validator);
						if( parentValidate ) {
							type = parentValidate.getChildType();
						}
						else {
							type = validator.introspectionStrategy.findType();
						}
						propName = processedModelExpression.propNameGetter(scope);
						childType = validator.introspectionStrategy.findType(null, type, propName);
					})();

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

					validate.getType = function() {
						return type;
					};

					validate.getChildType = function() {
						return childType;
					};

					validate.skipIndex = function() {
						if( childType.indexOf('[]') === childType.length-2 ) {
							childType = childType.substring(0, childType.length-2);
						}
					}
				},
				post: function(scope, elem, attrs, ctrls) {
				}
			};
		}
	};
}]);
