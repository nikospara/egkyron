export default class Vaccination {
	id: string | null;
	type: string | null;
	date: string | null;

	constructor(jsonArg?: Partial<Vaccination> | null | undefined) {
		var json = jsonArg || {};
		this.id = json.id || null;
		this.type = (json && json.type) || null;
		this.date = (json && json.date) || null;
	}

	static factory(jsonArg: Partial<Vaccination> | null | undefined): Vaccination | null {
		if( jsonArg ) {
			if( jsonArg instanceof Vaccination ) {
				return jsonArg;
			}
			else {
				return new Vaccination(jsonArg);
			}
		}
		else {
			return null;
		}
	}

	static arrayFactory(jsonArg: (Partial<Vaccination> | null | undefined)[] | null | undefined): Vaccination[] {
		if( !jsonArg || !Array.isArray(jsonArg) ) {
			return [];
		}
		else {
			return jsonArg.reduce((arr, v) => {
				const vaccination = Vaccination.factory(v);
				return vaccination ? [...arr, vaccination] : arr;
			}, [] as Vaccination[]);
		}
	}
}
