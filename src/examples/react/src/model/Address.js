export default class Address {
	constructor(jsonArg) {
		var json = jsonArg || {};
		this.street = (json && json.street) || null;
		this.number = (json && json.number) || null;
	}
}

Address.factory = function(jsonArg) {
	if( jsonArg ) {
		if( jsonArg instanceof Address ) {
			return jsonArg;
		}
		else {
			return new Address(jsonArg);
		}
	}
};

Address.validators = {
	number: ['nospaces']
};
