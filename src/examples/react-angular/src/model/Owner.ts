import { Validators } from 'model/Validators';
import Address from './Address';
import Pet from './Pet';

@Validators({
	name: [
//		'required',
		'nospaces',
		['length', {min: 2, max: 20}]
	],
	pets: null
})
export default class Owner {
	name: string | null;
	address: Address | null;
	pets: Pet[];

	constructor(jsonArg?: Partial<Owner> | null | undefined) {
		var json = jsonArg || {};
		this.name = json.name || null;
		this.address = Address.factory(json.address);
		this.pets = Pet.arrayFactory(json.pets);
	}
}
