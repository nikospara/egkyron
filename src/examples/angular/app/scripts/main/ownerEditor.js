angular.module('app').directive('ownerEditor', ['Pet', function(Pet) {
	return {
		restrict: 'E',
		templateUrl: 'scripts/main/ownerEditor.tpl.html',
		scope: {
			label: '@'
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function() {
			this.addPet = function(index) {
				console.log('ADD PET:', index);
				if( !this.owner.pets ) {
					this.owner.pets = [];
				}
				this.owner.pets.splice(index, 0, new Pet());
			};

			this.removePet = function(item) {
				console.log('REMOVE PET:', item);
				var index = this.owner.pets.indexOf(item);
				if( index >= 0 ) {
					this.owner.pets.splice(index, 1);
				}
			};
		},
		require: ['ownerEditor', 'ngModel'],
		link: function(scope, elem, attrs, ctrls) {
			var ownerEditor = ctrls[0], ngModel = ctrls[1];

			ngModel.$render = function() {
				ownerEditor.owner = ngModel.$viewValue;
			};

			// TODO Probably needs a deep watch too...
		}
	};
}]);
