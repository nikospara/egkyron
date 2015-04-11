Node and Angular example
========================

This example demonstrates the usage of Egkyron with AngularJS in the client and Node (with Express) in the server.

### Running

The example is encapsulated in a Gulp script. Run `npm install` and `bower install` and then run `gulp`.

Open:

- http://localhost:4000/index-constr.html , to see the example using the `ConstructorIntrospector`. With the `ConstructorIntrospector` the constraints are declared as "static" propertes of the constructor function.
- http://localhost:4000/index-ext.html , to see the example using the `ExternalConstraintsIntrospector`. With the `ExternalConstraintsIntrospector` the constraints are declared in an external configuration.

The fields with constraints are the name of the pet owner (length 2 to 20, no spaces) and the name of the pet (length 2 to 20 for the `ConstructorIntrospector`, and 2 to 10 for the `ExternalConstraintsIntrospector`, no spaces).

Shared code
-----------

A nice thing is that the same validation process can run in the server and in the client. The `shared` subdirectory contains code shared between the server and the client, that is the model, the validator registry (the map from validator name to implementation) and the constraints.

The constraints are kept together with the model for the `ConstructorIntrospector`, as:

```javascript
function Owner(json) {
	...
}
	
Owner.validators = {
	name: [
		'nospaces',
		['length', {min: 2, max: 20}]
	],
	pets: null
};
```

The constraints are provided by the `makeRules()` function for the case of the `ExternalConstraintsIntrospector`:

```javascript
function makeRules() {
	return {
		'Owner': {
			name: [
				'nospaces',
				['length', {min: 2, max: 20}]
			],
			pets: {
				type: 'Pet[]'
			}
		},
		...
	};
}
```

Node
----

Server-side validation and the corresponding REST services are implemented in `app.js`.

The validation is set up following 3 simple steps:

1. Make the validator registry:

	```javascript
	var validatorRegistry = require('./target/node/shared/makeValidatorRegistry')();
	```

2. Make the introspector:

	```javascript
	var constructorIntrospector = new ConstructorIntrospector();
	```

3. Make the validator:

	```javascript
	var validator = new Validator(validatorRegistry, constructorIntrospector);
	```

All the above can be cached. Then the actual validation is executed by simply calling:

```javascript
var vctx = validator.validate(owner);
```

The `vctx` is of type `ValidationContext`. It has a member called `result`, containing the detailed validation results. To quickly assess the validity of the model do:

```javascript
var isValid = vctx.result._thisValid && vctx.result._childrenValid !== false;
```

Angular
-------

Egkyron does not try do dictate how validation messages are presented to the user. This is entirely up to the application. The `ValidateController` has a method `handleMessage(validatorKey, validationResult)` that is called for each validation result for the current field. Its default implementation is blank, it is supposed to be implemented by the application.
