function Vaccination(json) {
	if( !(this instanceof Vaccination) ) return new Vaccination(json);
	this.type = json && json.type || null;
	this.date = json && json.date || null;
}
