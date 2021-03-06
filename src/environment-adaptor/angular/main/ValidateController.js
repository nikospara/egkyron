/**
 * @ngdoc type
 * @name egkyron.ValidateController
 *
 * @description
 * A controller to use in validation directives.
 */
angular.module('egkyron').controller('ValidateController', ['$scope', '$attrs', 'ValidationContext', function ValidateController($scope, $attrs, ValidationContext) {

	var
		unwatch,
		ngModel,
		processedModelExpression,
		validator,
		EMPTY_OBJECT = {},
		controller = this,
		type = null,
		childType = null,
		propName = null,
		parentValidate = null;

	/**
	 * @ngdoc method
	 * @name egkyron.ValidateController#configure
	 *
	 * @description
	 * Provide the controller with the required and optional dependencies.
	 *
	 * @param {NgModelController} ngModelValue - The `NgModelController`
	 * @param {Validator} validatorValue - The validator to use (see the `validator` directive)
	 * @param {ValidateController} parentValidateValue - The validator to use (see the `validator` directive)
	 */
	function configure(ngModelValue, validatorValue, parentValidateValue) {
		ngModel = ngModelValue;
		validator = validatorValue;
		parentValidate = parentValidateValue;

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
		childType = validator.introspectionStrategy.findType(null, controller.getType(), propName);
	}

	/**
	 * @ngdoc method
	 * @name egkyron.ValidateController#watchValidity
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
	 * @name egkyron.ValidateController#unwatchValidity
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
		var x, r, validity, results = evaluateConstraints(modelValue || viewValue, false);

		if( !results || !results._validity ) {
			validity = EMPTY_OBJECT;
		}
		else {
			validity = results._validity;
		}

		for( x in validity ) {
			if( !validity.hasOwnProperty(x) ) continue;
			r = validity[x];
			ngModel.$setValidity(x, r.isValid);
			controller.handleMessage(x, r);
		}

		return isValid(results);
	}

	function evaluateConstraints(value, eager) {
		var
			validationContext = extendValidationContext(new ValidationContext(value)),
			validationArgs;

		validationArgs = validator.introspectionStrategy.prepareValidationFromScope($scope, processedModelExpression, controller.getType());
		validator.evaluateConstraints(validationContext, validationArgs.constraints, validationArgs.ctxObject, value, eager);

		return validationContext.result;
	}

	function extendValidationContext(vctx) {
		var modelPathFixed = false, superGetModelPath = vctx.getModelPath;

		vctx.getModelPath = function() {
			if( !modelPathFixed ) {
				controller.calculateParentPath(vctx);
				modelPathFixed = true;
			}

			return superGetModelPath.apply(this, Array.prototype.slice.call(arguments, 0));
		};

		return vctx;
	}

	/**
	 * @ngdoc method
	 * @name egkyron.ValidateController#calculateParentPath
	 *
	 * @description
	 * Called lazilly the first time <code>ValidationContext.getModelPath()</code> is invoked
	 * to calculate the parent paths for this object.
	 * <p>
	 * Usually the validators will only care for the value of the field they are validating,
	 * or values of other fields of the same object that contains this field. The
	 * <code>ValidationContext.getModelPath()</code> method allows a validator to navigate up
	 * the model path and depend on values of parent model nodes. The <code>ValidateController</code>
	 * needs to take an extra step to construct the parent hierarchy, which is implemented by this method.
	 * <p>
	 * The current implementation walks the hierarchy of parent <code>ValidateController</code>s
	 * and prepends the value of the model of each parent to the <code>ValidationContext</code>.
	 * This method should be overriden if you need extra logic, e.g. if you need to prepend
	 * even more parent paths after reaching the top of the <code>ValidateController</code>
	 * hierarchy.
	 *
	 * @param {string} validatorKey - The validator key (e.g. <code>required</code> or <code>regExp</code>)
	 * @param {ValidationResult} validationResult - The validation result
	 */
	function calculateParentPath(vctx) {
		var validateCtrl = parentValidate;
		while( validateCtrl ) {
			vctx.prependParentPath(validateCtrl.getModelValue());
			validateCtrl = validateCtrl.getParentValidate();
		}
	}

	/**
	 * @ngdoc method
	 * @name egkyron.ValidateController#handleMessage
	 *
	 * @description
	 * Implement this method to handle validation messages.
	 *
	 * @param {string} validatorKey - The validator key (e.g. <code>required</code> or <code>regExp</code>)
	 * @param {ValidationResult} validationResult - The validation result
	 */
	function handleMessage(validatorKey, validationResult) {
		// jshint unused: false
		// INTENTIONALLY BLANK
	}

	/**
	 * @ngdoc method
	 * @name egkyron.ValidateController#getType
	 *
	 * @description
	 * Get the type of the object that contains the property being edited by this control.
	 * This method can be overriden by directives so as to define another type for the object containing
	 * this property; a use case would be:<br/>
	 *
	 * ```
	 *   <form validator="RootObjectValidator">
	 *     <input validate ng-model="root.name" /><!-- a property of the Root type -->
	 *     <input validate ng-model="root.address.street" validate-type="Address" /><!-- a property of the Address type -->
	 *   </form>
	 * ```
	 *
	 * @returns {string} - The type as string, or any other object as defined by the introspector
	 */
	function getType() {
		return type;
	}

	/**
	 * @ngdoc method
	 * @name egkyron.ValidateController#getChildType
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
	 * @name egkyron.ValidateController#getParentValidate
	 *
	 * @description
	 * Get the parent validate controller, if any.
	 *
	 * @returns {ValidateController} - The parent validate controller or <code>null</code>
	 */
	function getParentValidate() {
		return parentValidate;
	}

	/**
	 * @ngdoc method
	 * @name egkyron.ValidateController#getModelValue
	 *
	 * @description
	 * Get the current value of the model.
	 *
	 * @returns {any} - The current model value
	 */
	function getModelValue() {
		return ngModel.$modelValue;
	}

	/**
	 * @ngdoc method
	 * @name egkyron.ValidateController#skipIndex
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
		skipIndex: skipIndex,
		getParentValidate: getParentValidate,
		getModelValue: getModelValue,
		calculateParentPath: calculateParentPath
	});
}]);
