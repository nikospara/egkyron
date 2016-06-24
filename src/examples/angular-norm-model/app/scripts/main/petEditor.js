angular.module('app').directive('petEditor', ['Vaccination', 'store', function(Vaccination, store) {
	var GENDERS = [
		{ code: 'M', display: 'Male' },
		{ code: 'F', display: 'Female' }
	];

	var EMPTY_MAP = Object.freeze({});

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
				var vaccination = new Vaccination({ key: uuid.v4() });
				this.pet.vaccinations.push(vaccination.key);
				(store.data['Vaccination'] = store.data['Vaccination'] || {})[vaccination.key] = vaccination;
			};

			this.removeVaccination = function(item) {
				var index = this.pet.vaccinations.indexOf(item);
				if( index >= 0 ) {
					this.pet.vaccinations.splice(index,1);
					// XXX This assumes that each vaccination is referenced only once!
					delete store.data['Vaccination'][item];
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
