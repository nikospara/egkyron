angular.module('app').factory('validator', ['validatorRegistry', 'Validator', 'ConstructorIntrospector', function(validatorRegistry, Validator, ConstructorIntrospector) {
	return new Validator(validatorRegistry, new ConstructorIntrospector());
}]);
