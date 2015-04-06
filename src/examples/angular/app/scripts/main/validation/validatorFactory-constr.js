angular.module('validation').factory('validatorFactory', ['$http', 'AngularIntrospector', 'Validator', 'validatorRegistry', function($http, AngularIntrospector, Validator, validatorRegistry) {
	return function validatorFactory() {
		var validator = new Validator(validatorRegistry, new AngularIntrospector());

		validator.validateInServer = function(owner) {
			return $http.post('api/validate-constr/Owner', owner);
		};

		return validator;
	};
}]);
