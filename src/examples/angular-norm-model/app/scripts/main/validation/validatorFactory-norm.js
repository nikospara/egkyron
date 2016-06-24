angular.module('validation').factory('validatorFactory', ['$http', 'AngularIntrospector', 'Validator', 'validatorRegistry', 'rules', 'store', function($http, AngularIntrospector, Validator, validatorRegistry, rules, store) {
	return function validatorFactory(rootType) {
		var validator = new Validator(validatorRegistry, new AngularIntrospector(rules, rootType));

		validator.validateInServer = function(owner) {
			return $http.post('api/validate-ext/Owner', store.denormalize(owner, rootType));
		};

		return validator;
	};
}]);
