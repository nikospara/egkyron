import Address from './Address';
import Pet from './Pet';

export default class Owner {
	constructor(jsonArg) {
		var json = jsonArg || {};
		this.name = json.name || null;
		this.address = Address.factory(json.address);
		this.pets = json.pets ? json.pets.map(Pet.factory) : [];
	}
}

Owner.validators = {
	name: [
//		'required',
		'nospaces',
		['length', {min: 2, max: 20}]
	],
	pets: null
};
