angular.module('validation').factory('validatorFactory', ['AngularIntrospector', 'Validator', 'validatorRegistry', 'rules', function(AngularIntrospector, Validator, validatorRegistry, rules) {
	return function validatorFactory(rootType) {
		return new Validator(validatorRegistry, new AngularIntrospector(rules, rootType));
	};
}]);
