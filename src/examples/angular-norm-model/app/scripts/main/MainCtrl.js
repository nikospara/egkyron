angular.module('app').controller('MainCtrl', ['Owner', 'validatorFactory', '$modal', 'store', function(Owner, validatorFactory, $modal, store) {

	function validateInServer() {
		this.validator.validateInServer(this.model.owner)
			.then(function(response) {
				openJsonResultModal('Validation result', response.data);
			});
	}

	function validateInClient() {
		var validationResult = this.validator.validate(this.model.owner);
		openJsonResultModal('Validation result', validationResult.result);
	}

	function openJsonResultModal(title, json) {
		$modal.open({
			templateUrl: 'scripts/main/jsonResultModal/jsonResultModal.tpl.html',
			controller: 'JsonResultModalCtrl as ctrl',
			resolve: {
				title: function() {
					return title;
				},
				json: function() {
					return json;
				}
			}
		});
	}

	function showStore() {
		openJsonResultModal('Store', store.data);
	}

	angular.extend(this, {
		model: {
			owner: store.normalize(new Owner({
				key: 'the_owner',
				pets: [
					{ key: 'p1', name: '12345 7890x' }
				]
			}), 'Owner')
		},
		validator: validatorFactory('Owner'),
		validateInServer: validateInServer,
		validateInClient: validateInClient,
		showStore: showStore
	});

	store.data['Owner'] = {
		'the_owner': this.model.owner
	};
}]);
