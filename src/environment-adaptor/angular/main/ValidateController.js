angular.module('validation').controller('ValidateController', ['$scope', 'ValidationContext', function ValidateController($scope, ValidationContext) {

	var unwatch;

	function setNgModel(ngModel) {
		this.ngModel = ngModel;
		if( ngModel && ngModel.$validators ) {
			ngModel.$validators.validate = makeValidate();
		}
	}

	function watchValidity() {
		var self = this;
		unwatch = this.$scope.$watch(
			// TODO
		);
	}

	function unwatchValidity() {
		if( angular.isFunction(unwatch) ) {
			unwatch();
			unwatch = null;
		}
	}

	/**
	 * @returns {ValidationContext~results}
	 */
	function executeValidations(value) {
		var
			isValid = true,
			validationContext = new ValidationContext(),
			validationArgs;

		validationContext.rules = validationRules;
		validationContext.validationRuleKey = validationRuleKey;
		validationArgs = validation.introspector.prepareValidationFromScope(validationContext, $scope, processElementResult);
		validation.executeValidations(validationContext, validationArgs.constraints, validationArgs.ctxObject, value, true);

		return validationContext.results;
	}

	angular.extend(this, {
		setNgModel: setNgModel,
		watchValidity: watchValidity,
		unwatchValidity: unwatchValidity
	});
}]);
