Egkyron
=======

Egkyron is a validation infrasrtructure library, with the goal of being capable to adapt to
various kinds of Javascript model objects, e.g. plain JSON, Knockout etc and environments,
e.g. Node, Browser+AngularJS, Browser+React etc. The word *egkyron* means *valid* in Greek.

Egkyron undertakes the task of model validation in addition to form validation. Form validation
has already been implemented for the targeted frameworks, such as AngularJS. This means that,
given some data (the model) and a defined set of validation rules, it decides the validity
of the overall model and individual parts of it. It provides infrastructure for error
message generation of the invalid parts of the model. And it provides infrastructure
for integrating with form validation, so that error messages can be displayed to the user
as appropriate.

Egkyron tries to provide the infrastructure for validation up to the generation of a data
structure containing detailed information about the errors of the model. It is up to the user
how will these error be displayed. Look in the `src/examples` folder for sample implementations
of the display logic.

[Here](http://plnkr.co/edit/PiOuMT) is a plunk version of the [Angular example](https://github.com/nikospara/egkyron/tree/master/src/examples/angular).

### Changes

- (2017/08/10) Incorporated the `condition` branch into master; it adds the `condition` constraint parameter to conditionally deactivate the validation
- (2016/06/09) The [React example](src/examples/react/README.md) is in the master.

### Implementation state

Currently the core has been implemented, as well as Node and AngularJS integration. An example in React is also added, using the NPM package directly. Integration with React for this example is so simple, that no separate packaging project was made.

Use cases - what was it made for
--------------------------------

1. A single, large model, displayed in many views
2. The need to separate business logic, in this case the validation rules, from the view
3. No form validation (e.g. server-side)

### Anti-use cases

1. Simple forms

Design
------

The concerns in a validation solution addressed by Egkyron are:

1. The core validation logic
2. Model introspection strategies
3. Adapting to different environments (e.g. Node, Browser)
4. Common validators

Moreover Egkyron takes care of:

1. Packaging its components for the supported environments

Example usage
-------------

```javascript
// SETUP
//   all the following objects need to be created once and can then be reused
// the validatorRegistry knows the various validators
var validatorRegistry = makeValidatorRegistry();
// the introspector knows how to extract information from the model
var introspector = new ConstructorIntrospector();
// the validator implements the core logic
var validator = new Validator(validatorRegistry, introspector);

// VALIDATE
// the data to validate
var data = ...
// validate and get the results
var results = validator.validate(data);

// USE THE RESULTS
// the overall validity flag
var isValid = results._thisValid && results._childrenValid !== false;
// the error message for the `required` validator of the `data.name` field
var nameErrorMsg = results._children['name']._validity['required'].message;
```

Building
--------

```shell
npm install
bower install
gulp
```

To clean, simply do:

```shell
rm -rf target
```

Installing to npm
-----------------

The directory that will get installed is `target/dist/node`; it contains all the
things needed. So, after building, do:

```shell
cd target/dist/node
npm publish
```

Alternatively, you may want to link for development purposes:

```shell
cd target/dist/node
npm link
```
