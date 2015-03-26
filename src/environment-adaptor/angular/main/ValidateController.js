angular.module('validation').controller('ValidateController', ['$scope', '$attrs', 'ValidationContext', function ValidateController($scope, $attrs, ValidationContext) {

	var unwatch, ngModel, processedModelExpression, validator, EMPTY_OBJECT = {}, controller = this;

	function configure(ngModelValue, validatorValue) {
		ngModel = ngModelValue;
		validator = validatorValue;

		if( !ngModel ) {
			throw new Error('the ngModel is required');
		}
		if( !validator ) {
			throw new Error('the validator is required');
		}

		processedModelExpression = validator.introspectionStrategy.processModelExpression($attrs.ngModel);
		ngModel.$validators.validate = validate;

		return processedModelExpression;
	}

	function watchValidity() {
		unwatch = $scope.$watch(
			function() {
				var results = evaluateConstraints(ngModel.$modelValue, true);
				return isValid(results);
			},
			function(newval, oldval) {
				if( newval !== oldval ) {
					ngModel.$validate();
				}
			}
		);
	}

	function unwatchValidity() {
		if( angular.isFunction(unwatch) ) {
			unwatch();
			unwatch = null;
		}
	}

	function validate(modelValue, viewValue) {
		var x, r, results = evaluateConstraints(modelValue || viewValue, false);

		if( !results._validity ) {
			results._validity = EMPTY_OBJECT;
		}

		for( x in results._validity ) {
			if( !results._validity.hasOwnProperty(x) ) continue;
			r = results._validity[x];
			ngModel.$setValidity(x, r.isValid);
			controller.handleMessage(x, r);
		}

		return isValid(results);
	}

	function evaluateConstraints(value, eager) {
		var
			isValid = true,
			validationContext = new ValidationContext(),
			validationArgs;

		validationArgs = validator.introspectionStrategy.prepareValidationFromScope($scope, processedModelExpression, controller.getType());
		validator.evaluateConstraints(validationContext, validationArgs.constraints, validationArgs.ctxObject, value, eager);

		return validationContext.result;
	}

	function handleMessage(validatorKey, validationResult) {
		// INTENDED TO BE IMPLEMENTED BY SUBCLASSES
	}

	/**
	 * Get the type of the object that contains the property being edited by this control.
	 * @returns {string} - The type as string, or any other object as defined by the introspector
	 */
	function getType() {
		// INTENDED TO BE IMPLEMENTED BY SUBCLASSES
		return null;
	}

	function isValid(results) {
		return results == null || (results._thisValid && (angular.isUndefined(results._childrenValid) || results._childrenValid === true));
	}

	angular.extend(this, {
		configure: configure,
		watchValidity: watchValidity,
		unwatchValidity: unwatchValidity,
		handleMessage: handleMessage,
		getType: getType
	});
}]);
