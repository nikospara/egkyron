import { Validators } from 'model/Validators';

@Validators({
	number: ['nospaces']
})
export default class Address {
	street: string | null;
	number: string | null;

	constructor(jsonArg?: Partial<Address> | null | undefined) {
		var json = jsonArg || {};
		this.street = (json && json.street) || null;
		this.number = (json && json.number) || null;
	}

	static factory(jsonArg: Partial<Address> | null | undefined): Address | null {
		if( jsonArg ) {
			if( jsonArg instanceof Address ) {
				return jsonArg;
			}
			else {
				return new Address(jsonArg);
			}
		}
		else {
			return null;
		}
	}
}
