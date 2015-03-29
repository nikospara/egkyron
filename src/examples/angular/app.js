// curl -X POST -H "Contame\": \"Nik os\"}" http://localhost:3000/api/validate/Owner

var
	express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	Owner = require('./target/node/shared/Owner'),
	Pet = require('./target/node/shared/Pet'),
	Vaccination = require('./target/node/shared/Vaccination'),
	Validator = require('../../../target/dist/node/Validator'),
	ConstructorIntrospector = require('../../../target/dist/node/introspection-strategy/ConstructorIntrospector'),
	validatorRegistry = require('./target/node/shared/makeValidatorRegistry')();

app.use(bodyParser.json());
app.use(express.static('app'));
app.use(express.static('bower_components'));
app.use(express.static('../../../target'));
app.use(express.static('target/web'));

app.post('/api/Owner', function (req, res) {
	var
		json = req.body || {},
		owner = new Owner(json);
	owner.serverTime = new Date().getTime();
	res.json(owner);
});

app.post('/api/validate/Owner', function (req, res) {
	var
		json = req.body || {},
		owner = new Owner(json),
		vctx = validateOwner(owner);
	res.json(vctx ? vctx.result : null);
});

module.exports = app;

function validateOwner(owner) {
	var validator, constructorIntrospector;
	constructorIntrospector = new ConstructorIntrospector();
	validator = new Validator(validatorRegistry, constructorIntrospector);
	return validator.validate(owner);
}
