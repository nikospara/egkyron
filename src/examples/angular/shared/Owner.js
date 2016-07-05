function Owner(json) {
	if( !(this instanceof Owner) ) return new Owner(json);
	this.name = json && json.name || null;
	this.address = json && json.address || null;
	this.pets = json && json.pets ? json.pets.map(Pet) : [];
}

Owner.validators = {
	name: [
//		'required',
		'nospaces',
		['length', {min: 2, max: 20}]
	],
	address: [
		// required, even if no validators are present;
		// it signals the introspector that has enumerationMode === 'VALIDATORS'
		// to descend into this property
	],
	pets: null
};
