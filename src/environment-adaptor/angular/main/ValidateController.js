/**
 * @ngdoc type
 * @name validation.ValidateController
 *
 * @description
 * A controller to use in validation directives.
 */
angular.module('validation').controller('ValidateController', ['$scope', '$attrs', 'ValidationContext', function ValidateController($scope, $attrs, ValidationContext) {

	var
		unwatch,
		ngModel,
		processedModelExpression,
		validator,
		EMPTY_OBJECT = {},
		controller = this,
		type = null,
		childType = null,
		propName = null;

	/**
	 * @ngdoc method
	 * @name validation.ValidateController#configure
	 *
	 * @description
	 * Provide the controller with the required and optional dependencies.
	 *
	 * @param {NgModelController} ngModelValue - The `NgModelController`
	 * @param {Validator} validatorValue - The validator to use (see the `validator` directive)
	 * @param {ValidateController} parentValidate - The validator to use (see the `validator` directive)
	 */
	function configure(ngModelValue, validatorValue, parentValidate) {
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

		if( parentValidate ) {
			type = parentValidate.getChildType();
		}
		else {
			type = validator.introspectionStrategy.findType();
		}
		propName = processedModelExpression.propNameGetter($scope);
		childType = validator.introspectionStrategy.findType(null, type, propName);
	}

	/**
	 * @ngdoc method
	 * @name validation.ValidateController#watchValidity
	 *
	 * @description
	 * Watch the validity of this model.
	 *
	 * Watches can be expensive, so it is made optional. A watch on the validity is
	 * required if the validity this field depends on others.
	 */
	function watchValidity() {
		if( !unwatch ) {
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
	}

	/**
	 * @ngdoc method
	 * @name validation.ValidateController#unwatchValidity
	 *
	 * @description
	 * Stop watch the validity of this model.
	 */
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

	/**
	 * @ngdoc method
	 * @name validation.ValidateController#handleMessage
	 *
	 * @description
	 * Implement this method to handle validation messages.
	 *
	 * @param {string} validatorKey - The validator key (e.g. <code>required</code> or <code>regExp</code>)
	 * @param {ValidationResult} validationResult - The validation result
	 */
	function handleMessage(validatorKey, validationResult) {
		// INTENTIONALLY BLANK
	}

	/**
	 * @ngdoc method
	 * @name validation.ValidateController#getType
	 *
	 * @description
	 * Get the type of the object that contains the property being edited by this control.
	 *
	 * @returns {string} - The type as string, or any other object as defined by the introspector
	 */
	function getType() {
		return type;
	}

	/**
	 * @ngdoc method
	 * @name validation.ValidateController#getChildType
	 *
	 * @description
	 * Get the type of the the property being edited by this control, to be used by nested validation
	 * directives to determine the type of their object.
	 *
	 * @returns {string} - The child type as string, or any other object as defined by the introspector
	 */
	function getChildType() {
		return childType;
	}

	/**
	 * @ngdoc method
	 * @name validation.ValidateController#skipIndex
	 *
	 * @description
	 * Instruct {@link validation.ValidateController#getChildType() `getChildType()`} to return the type of the array elements,
	 * if the type of the property being edited is array.
	 */
	function skipIndex() {
		if( childType && childType.indexOf('[]') === childType.length-2 ) {
			childType = childType.substring(0, childType.length-2);
		}
	}

	function isValid(results) {
		return results == null || (results._thisValid && (angular.isUndefined(results._childrenValid) || results._childrenValid === true));
	}

	angular.extend(this, {
		configure: configure,
		watchValidity: watchValidity,
		unwatchValidity: unwatchValidity,
		handleMessage: handleMessage,
		getType: getType,
		getChildType: getChildType,
		skipIndex: skipIndex
	});
}]);
