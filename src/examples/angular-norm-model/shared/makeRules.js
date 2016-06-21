function makeRules() {
	return {
		'Owner': {
			name: [
//				'required',
				'nospaces',
				['length', {min: 2, max: 20}]
			],
			pets: {
				type: 'Pet[]'
			}
		},
		'Pet': {
			name: [
//				'required',
				'nospaces',
				['length', {min: 3, max: 10}]
			],
			vaccinations: {
				type: 'Vaccination[]'
			}
		},
		'Vaccination': {

		}
	};
}
