angular.module('validation').controller('ValidateController', ['$scope', '$attrs', 'ValidationContext', 'validator', function ValidateController($scope, $attrs, ValidationContext, validator) {

	var unwatch, ngModel, processedModelExpression, EMPTY_OBJECT = {}, controller = this;

	processedModelExpression = validator.introspectionStrategy.processModelExpression($attrs.ngModel);

	function setNgModel(value) {
		ngModel = value;
		if( ngModel && ngModel.$validators ) {
			ngModel.$validators.validate = validate;
		}
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

		validationArgs = validator.introspectionStrategy.prepareValidationFromScope($scope, processedModelExpression);
		validator.evaluateConstraints(validationContext, validationArgs.constraints, validationArgs.ctxObject, value, eager);

		return validationContext.result;
	}

	function handleMessage(validatorKey, validationResult) {
		// INTENDED TO BE IMPLEMENTED BY SUBCLASSES
	}

	function isValid(results) {
		return results == null || (results._thisValid && (angular.isUndefined(results._childrenValid) || results._childrenValid === true));
	}

	angular.extend(this, {
		setNgModel: setNgModel,
		watchValidity: watchValidity,
		unwatchValidity: unwatchValidity,
		handleMessage: handleMessage
	});
}]);