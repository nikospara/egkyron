angular.module('app').directive('petEditor', ['Vaccination', 'store', function(Vaccination, store) {
	var GENDERS = [
		{ code: 'M', display: 'Male' },
		{ code: 'F', display: 'Female' }
	];

	var EMPTY_MAP = {};

	return {
		restrict: 'E',
		templateUrl: 'scripts/main/petEditor.tpl.html',
		scope: {
			index: '=',
			addItem: '&',
			removeItem: '&'
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function() {
			this.genders = GENDERS;

			this.addVaccination = function() {
				if( !this.pet.vaccinations ) {
					this.pet.vaccinations = [];
				}
				this.pet.vaccinations.push(new Vaccination());
			};

			this.removeVaccination = function(item) {
				var index = this.pet.vaccinations.indexOf(item);
				if( index >= 0 ) {
					this.pet.vaccinations.splice(index,1);
				}
			};

			Object.defineProperty(this, 'vaccinations', {
				get: function() {
					return store.data['Vaccination'] || EMPTY_MAP;
				}
			});
		},
		require: ['petEditor', 'ngModel'],
		link: function(scope, elem, attrs, ctrls) {
			var petEditor = ctrls[0], ngModel = ctrls[1];
			
			ngModel.$render = function() {
				petEditor.pet = ngModel.$viewValue;
			};
			
			// TODO Probably needs a deep watch too...
		}
	};
}]);
