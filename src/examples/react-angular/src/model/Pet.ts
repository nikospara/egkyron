import { Validators } from 'model/Validators';
import Vaccination from './Vaccination';

@Validators({
	name: [
//		'required',
		'nospaces',
		['length', {min: 3, max: 20}]
	]
})
export default class Pet {
	id: string | null;
	name: string | null;
	type: string | null;
	gender: string | null;
	vaccinations: Vaccination[];

	constructor(jsonArg?: Partial<Pet> | null | undefined) {
		var json = jsonArg || {};
		this.id = json.id || null;
		this.name = (json && json.name) || null;
		this.type = (json && json.type) || null;
		this.gender = (json && json.gender) || null;
		this.vaccinations = Vaccination.arrayFactory(json.vaccinations);
	}

	static factory(jsonArg: Partial<Pet> | null | undefined): Pet | null {
		if( jsonArg ) {
			if( jsonArg instanceof Pet ) {
				return jsonArg;
			}
			else {
				return new Pet(jsonArg);
			}
		}
		else {
			return null;
		}
	}

	static arrayFactory(jsonArg: (Partial<Pet> | null | undefined)[] | null | undefined): Pet[] {
		if( !jsonArg || !Array.isArray(jsonArg) ) {
			return [];
		}
		else {
			return jsonArg.reduce((arr, v) => {
				const vaccination = Pet.factory(v);
				return vaccination ? [...arr, vaccination] : arr;
			}, [] as Pet[]);
		}
	}
}
