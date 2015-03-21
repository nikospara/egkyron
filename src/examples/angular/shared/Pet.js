function Pet(json) {
	if( !(this instanceof Pet) ) return new Pet(json);
	this.name = json && json.name || null;
	this.type = json && json.type || null;
	this.gender = json && json.gender || null;
	this.vaccinations = json && json.vaccinations ? json.vaccinations.map(Vaccination) : [];
}

Pet.validators = {
	name: [
//		'required',
		'nospaces',
		['length', {min: 2, max: 20}]
	]
};
