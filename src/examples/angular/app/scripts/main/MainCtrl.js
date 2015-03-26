angular.module('app').controller('MainCtrl', ['$http', 'Owner', 'validator', '$modal', function($http, Owner, validator, $modal) {
	this.model = {
		owner: new Owner({
			pets: [
				{ name: '12345 7890x' }
			]
		})
	};

	this.validateInServer = function() {
		$http.post('api/validate/Owner', this.model.owner)
			.then(function(response) {
				openValidationResultModal(response.data);
			});
	};

	this.validateInClient = function() {
		var validationResult = validator.validate(this.model.owner);
		openValidationResultModal(validationResult.result)
	};

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
}]);
