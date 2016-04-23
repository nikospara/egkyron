import Vaccination from './Vaccination';

export default class Pet {
	constructor(jsonArg) {
		var json = jsonArg || {};
		this.id = json.id || null;
		this.name = json && json.name || null;
		this.type = json && json.type || null;
		this.gender = json && json.gender || null;
		this.vaccinations = json && json.vaccinations ? json.vaccinations.map(Vaccination.factory) : [];
	}
}

Pet.factory = function(jsonArg) {
	if( jsonArg ) {
		if( jsonArg instanceof Pet ) {
			return jsonArg;
		}
		else {
			return new Pet(jsonArg);
		}
	}
};

Pet.validators = {
	name: [
//		'required',
		'nospaces',
		['length', {min: 3, max: 20}]
	]
};
