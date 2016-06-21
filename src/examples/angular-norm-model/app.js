// curl -X POST -H "Contame\": \"Nik os\"}" http://localhost:3000/api/validate/Owner

var
	express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	Owner = require('./target/node/shared/Owner'),
	Pet = require('./target/node/shared/Pet'),
	Vaccination = require('./target/node/shared/Vaccination'),
	egkyron = require('egkyron'),
	Validator = egkyron.Validator,
	ConstructorIntrospector = egkyron.introspectionStrategy.ConstructorIntrospector,
	ExternalConstraintsIntrospector = egkyron.introspectionStrategy.ExternalConstraintsIntrospector,
	validatorRegistry = require('./target/node/shared/makeValidatorRegistry')();
	validationRules = require('./target/node/shared/makeRules')();

app.use(bodyParser.json());
app.use(express.static('app'));
app.use(express.static('bower_components'));
app.use(express.static('../../../target'));
app.use(express.static('target/web'));

app.post('/api/validate-constr/Owner', function (req, res) {
	var
		json = req.body || {},
		owner = new Owner(json),
		vctx = validateOwnerConstr(owner);
	res.json(vctx ? vctx.result : null);
});

app.post('/api/validate-ext/Owner', function (req, res) {
	var
		json = req.body || {},
		owner = new Owner(json),
		vctx = validateOwnerExt(owner);
	res.json(vctx ? vctx.result : null);
});

function validateOwnerConstr(owner) {
	var validator, constructorIntrospector;
	constructorIntrospector = new ConstructorIntrospector();
	validator = new Validator(validatorRegistry, constructorIntrospector);
	return validator.validate(owner);
}

function validateOwnerExt(owner) {
	var validator, constructorIntrospector;
	extIntrospector = new ExternalConstraintsIntrospector(validationRules, 'Owner');
	validator = new Validator(validatorRegistry, extIntrospector);
	return validator.validate(owner);
}

module.exports = app;
