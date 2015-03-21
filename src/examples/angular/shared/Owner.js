function Owner(json) {
	if( !(this instanceof Owner) ) return new Owner(json);
	this.name = json && json.name || null;
	this.pets = json && json.pets ? json.pets.map(Pet) : [];
}
	
Owner.validators = {
	name: [
//		'required',
		'nospaces',
		['length', {min: 2, max: 20}]
	]
};
