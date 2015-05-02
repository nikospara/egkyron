Node and Angular example
========================

This example demonstrates the usage of Egkyron with AngularJS in the client and Node (with Express) in the server.

### Running

The example is encapsulated in a Gulp script. Egkyron must have been built before running this example. Run `npm install` and `bower install` and then run `gulp` (running `gulp` also starts the server).

Open:

- http://localhost:4000/index-constr.html , to see the example using the `ConstructorIntrospector`. With the `ConstructorIntrospector` the constraints are declared as "static" propertes of the constructor function.
- http://localhost:4000/index-ext.html , to see the example using the `ExternalConstraintsIntrospector`. With the `ExternalConstraintsIntrospector` the constraints are declared in an external configuration.

The fields with constraints are the name of the pet owner (length 2 to 20, no spaces) and the name of the pet (length 3 to 20 for the `ConstructorIntrospector`, and 3 to 10 for the `ExternalConstraintsIntrospector`, no spaces).

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

This example gives one possible implementation; it can be used as is, or as a starting point to develop one that suits exactly the needs of the application.

### Form validation

The fundamental structure for a form control in this example is:

```html
<div class="form-group" validity-coordinator>
	<label>Name</label>
	<input validate ng-model="ctrl.owner.name" type="text" class="form-control"/>
	<validity-indicator></validity-indicator>
</div>
```

There are 3 custom directives:

- The `validate` directive

	It uses the `NgModelController` and the `ValidateController` from Egkyron to execute the validations defined by Egkyron. It overrides `ValidateController.handleMessage()` to notify the `validity-coordinator`.

- The `validity-coordinator` directive

	It knows the validity state of the contained `ng-model` and applies Bootstrap's `has-error` CSS class accordingly. Also it stores the validation messages to be used by the `validity-indicator`.

- The `validity-indicator` directive

	It is responsible for displaying validation messages. It retrieves those messages from the `validity-coordinator`.

### Programmatic validation in the client

The entire model (or some fraction of it actually) can be validated programmatically in the client too. There are several components involved but, essentially, the steps are the same as in the server case:

1. Make the validator registry. The build script has packaged the `makeValidatorRegistry` function as an angular service, so you just have to require it:

	```javascript
	angular.module('validation').factory('validatorFactory', [..., 'validatorRegistry',
		function(..., validatorRegistry) {
			...
		}
	]);
	```

2. Make the introspector. For the Angular environment, the introspector has to implement a couple of more methods. The code can be found in `AngularIntrospector-constr.js` and `AngularIntrospector-ext.js`.

	```javascript
	AngularIntrospector.prototype.processModelExpression = function(modelExpression) {
		// process the ng-model expression to extract the expression that
		// retrieves the property name and the one that gets the object
		// containing the property
	};
	AngularIntrospector.prototype.prepareValidationFromScope = function(scope, processElementResult) {
		// apply the expressions from processModelExpression() to get the
		// actual property name and object
	};
	```

	Having defined the introspector as an Angular service, you only have to require it from now on.

3. Make the validator. Again this is an Angular service, defined in `validatorFactory-constr.js` and `validatorFactory-ext.js`. These services define a factory for validators, each component that needs to do validatoin has to invoke the factory with the name of the root entity:

	```javascript
	// in MainCtrl.js
	validator: validatorFactory('Owner')
	```
