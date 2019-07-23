export default function makeRules() {
	return {
		'Owner': {
			name: [
//				'required',
				'nospaces',
				['length', {min: 2, max: 20}]
			],
			address: {
				type: 'Address'
			},
			pets: {
				type: 'Pet[]'
			}
		},
		'Address': {
			number: ['nospaces']
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
