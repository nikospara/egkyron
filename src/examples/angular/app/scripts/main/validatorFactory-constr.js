angular.module('validation').factory('validatorFactory', ['AngularIntrospector', 'Validator', 'validatorRegistry', function(AngularIntrospector, Validator, validatorRegistry) {
	return function validatorFactory() {
		return new Validator(validatorRegistry, new AngularIntrospector());
	};
}]);
