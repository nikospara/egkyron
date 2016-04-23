export default class Vaccination {
	constructor(jsonArg) {
		var json = jsonArg || {};
		this.id = json.id || null;
		this.type = json && json.type || null;
		this.date = json && json.date || null;
	}
}

Vaccination.factory = function(jsonArg) {
	if( jsonArg ) {
		if( jsonArg instanceof Vaccination ) {
			return jsonArg;
		}
		else {
			return new Vaccination(jsonArg);
		}
	}
};
