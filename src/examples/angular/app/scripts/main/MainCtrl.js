angular.module('app').controller('MainCtrl', ['$http', 'Owner', 'validatorFactory', '$modal', function($http, Owner, validatorFactory, $modal) {

	function validateInServer() {
		$http.post('api/validate/Owner', this.model.owner)
			.then(function(response) {
				openValidationResultModal(response.data);
			});
	}

	function validateInClient() {
		var validationResult = this.validator.validate(this.model.owner);
		openValidationResultModal(validationResult.result)
	}

	function openValidationResultModal(validationResult) {
		$modal.open({
			templateUrl: 'scripts/main/validationResultModal/validationResultModal.tpl.html',
			controller: 'ValidationResultModalCtrl as ctrl',
			resolve: {
				validationResult: function() {
					return validationResult;
				}
			}
		});
	}

	angular.extend(this, {
		model: {
			owner: new Owner({
				pets: [
					{ name: '12345 7890x' }
				]
			})
		},
		validator: validatorFactory('Owner'),
		validateInServer: validateInServer,
		validateInClient: validateInClient
	});
}]);
