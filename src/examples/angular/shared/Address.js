function Address(jsonArg) {
	if( !(this instanceof Address) ) return new Address(jsonArg);
	this.street = jsonArg && jsonArg.street || null;
	this.number = jsonArg && jsonArg.number || null;
}

Address.validators = {
	number: ['nospaces']
};
