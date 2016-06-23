function Vaccination(json) {
	if( !(this instanceof Vaccination) ) return new Vaccination(json);
	this.key = json && json.key || null;
	this.type = json && json.type || null;
	this.date = json && json.date || null;
}
