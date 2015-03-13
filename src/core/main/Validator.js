/* exported Validator */
/* global Constraint */
/**
 * The core object for validation.
 *
 * @constructor
 *
 * @param {ValidatorRegistry} validatorRegistry - The validator registry.
 * @param {IntrospectionStrategy} IntrospectionStrategy - The constraints strategy.
 */
function Validator(validatorRegistry, introspectionStrategy) {
	/**
	 * The validator registry.
	 * @member {ValidatorRegistry}
	 */
	this.validatorRegistry = validatorRegistry;
	/**
	 * The introspection strategy.
	 * @member {IntrospectionStrategy}
	 */
	this.introspectionStrategy = introspectionStrategy;
}

/**
 * The default validation groups.
 * @static
 */
Validator.DEFAULT_GROUPS = ['default'];

/**
 * Validate a model, optionally running only the specified groups.
 * <p>
 * This is the main entry point for the model validation.
 * </p>
 *
 * @param {any} model - The model to validate.
 * @param {boolean} [eager] - If <code>true</code>, validation will stop at the first invalid field.
 * @param {string[]} [groups] - The groups to validate.
 * @returns {ValidationContext}
 */
Validator.prototype.validate = function(model, eager, groups) {
	var props, vctx = new ValidationContext(), nparams = 3, calculatedEager = eager, calculatedGroups = groups;
	if( model != null ) {
		if( Array.isArray(calculatedEager) ) {
			calculatedGroups = calculatedEager;
			calculatedEager = false;
			nparams -= 1;
		}
		if( !Array.isArray(calculatedGroups) ) {
			calculatedGroups = null;
			nparams -= 1;
		}
		if( typeof(calculatedEager) !== "boolean" ) {
			calculatedEager = false;
			nparams -= 1;
		}
		props = arguments.length > nparams ? Array.prototype.slice.call(arguments, nparams) : null;
		this.validateProperties(vctx, model, null, calculatedEager, calculatedGroups, props);
	}
	return vctx;
};

/**
 * Recursively validate the properties of the <code>model</code> object, optionally running only the specified groups
 * and limiting validation to the given properties.
 *
 * @protected
 * @param {ValidationContext} vctx - The validation context.
 * @param {any} model - The object whose properties will be validated.
 * @param {string} type - The type key of the value being validated.
 * @param {boolean} [eager] - If <code>true</code>, validation will stop at the first invalid field.
 * @param {string[]} [groups] - The groups to validate.
 * @param {string[]} [props] - The properties of <code>model</code> to validate.
 * @returns {boolean} - If validation should go on.
 */
Validator.prototype.validateProperties = function(vctx, model, type, eager, groups, props) {
	var self = this;
	props = sanitizeProps(props);
	return this.introspectionStrategy.enumerateProps(model, type, vctx, function(propName) {
		var ret, constraints, propValue;
		if( props == null || props.indexOf(propName) >= 0 ) {
			constraints = self.introspectionStrategy.extractConstraintsFromContext(vctx, model, type, propName);
			propValue = self.introspectionStrategy.evaluate(model, propName, type, vctx);
			vctx.pushPath(propName);
			self.evaluateConstraints(vctx, constraints, model, propValue, eager, groups);
			if( (!eager || !vctx.hasValidationErrors()) && (propValue != null && typeof(propValue) === 'object') ) {
				if( !(propValue instanceof Date) ) { // add other trivial cases where we do not want to step into object
					ret = self.validateProperties(vctx, propValue, self.introspectionStrategy.findType(vctx, type, propName), eager, groups);
					if( ret === false ) {
						return false;
					}
				}
			}
			vctx.popPath();
			if( eager && vctx.hasValidationErrors() ) {
				return false;
			}
		}
	});
};

/**
 * Sanitize the <code>propes</code> argument of {@linkcode validateProperties}, to be either an array,
 * if the original is non-<code>null</code>, or <code>null</code> otherwise, to signal that the <code>props</code>
 * argument should be disregarded and all properties must be validated.
 *
 * @memberof Validator
 * @private
 * @param {string[]} props - The original <code>props</code>.
 * @returns {string[]} - The sanitized <code>props</code>.
 */
function sanitizeProps(props) {
	if( props == null ) {
		return null;
	}
	var i, ret = [];
	for( i=0; i < props.length; i++ ) {
		if( props[i] != null ) ret.push(props[i]);
	}
	return ret.length > 0 ? ret : null;
}

/**
 * Validate a value given the constraints, optionally running only the specified groups.
 * Reports the validation result in the given validation context.
 * <p>
 * This is a secondary entry point to the validation process, used to validate a single field (e.g. from the UI).
 * </p>
 *
 * @param {ValidationContext} vctx - The validation context.
 * @param {Constraint[]} constraints - The constraints; may be <code>Constraint</code> objects or expressed in a shorthand form, e.g. a single <code>string</code> would indicate that the <code>Constraint.validator</code> should be read from an external mapping.
 * @param {Object} ctxObject - The object that contains the value being validated, will be used as <code>this</code> in the validator functions. May be <code>null</code>, if the validators do not use it.
 * @param {any} value - The value being validated.
 * @param {boolean} [eager] - If <code>true</code>, validation will stop at the first failed contstraint.
 * @param {string[]} [groups] - The groups to validate.
 */
Validator.prototype.evaluateConstraints = function(vctx, constraints, ctxObject, value, eager, groups) {
	var i, res, constraint;
	if( constraints ) {
		if( groups == null ) groups = Validator.DEFAULT_GROUPS;
		constraints = this.normalizeConstraints(constraints);
		for (i = 0; i < constraints.length; i++) {
			constraint = constraints[i];
			if( inGroups(constraint, groups) ) {
				vctx.setCurrentConstraintName(constraint.key);
				res = constraint.validator.call(ctxObject, value, constraint.params, vctx);
				if( typeof(res) === "boolean" ) {
					vctx.addResult(res);
				}
				vctx.setCurrentConstraintName(null);
				if( eager && res === false ) {
					break;
				}
			}
		}
	}
};

/**
 * Normalize an array of constraints and cache the result.
 *
 * @protected
 *
 * @param {any[]} constraints - The array of constraints.
 * @returns {Constraint[]}
 */
Validator.prototype.normalizeConstraints = function(constraints) {
	var i;
	// TODO Let the introspector decide how to cache the normalized constraints
	// TODO Let the constraints be real Constraint objects
	if( !constraints._normalized ) {
		constraints._normalized = [];
		for( i=0; i < constraints.length; i++ ) {
			constraints._normalized.push(this.normalizeConstraint(constraints[i]));
		}
	}
	return constraints._normalized;
};

/**
 * Normalize a constraint, possibly expressed in a shorthand form, to a
 * proper <code>Constraint</code> object. This logic can be extended or
 * overriden by implementations. The current implementation allows for
 * the following shorthands:
 *
 * <dl>
 *   <dt><code>string</code></dt>
 *   <dd>This string is the key of the constraint; the validation function is read from an external mapping.</dd>
 *   <dt><code>Array</code></dt>
 *   <dd>Contains the following values, with only the key being mandatory:
 *     <ol>
 *       <li>The key of the constraint</li>
 *       <li>The validator function, or the key to the validator function (if it needs to be different than the constraint key for any reason)</li>
 *       <li>The parameters to the validation function, including the groups.</li>
 *     </ol>
 *   </dd>
 * </dl>
 *
 * @protected
 *
 * @param {any} constraint - A constraint object, possibly in shorthand form.
 * @returns {Constraint}
 */
Validator.prototype.normalizeConstraint = function(constraint) {
	// TODO Let the constraints be real Constraint objects
	var validatorKey;
	// Allow shorthand validator definition, e.g. (note, no nested array):
	//   MyClass.myFieldValidators = [  "futureDate"  ];
	// instead of:
	//   MyClass.myFieldValidators = [ ["futureDate","futureDate"] ];
	if( typeof(constraint) === "string" ) {
		constraint = [constraint, constraint];
	}
	// Allow shorthand:
	//   MyClass.myFieldValidators = [ ["length", {max: 9}] ];
	// instead of:
	//   MyClass.myFieldValidators = [ ["length", "length", {max: 9}] ];
	if( typeof(constraint[1]) === "object" && constraint[2] == null ) {
		constraint[2] = constraint[1];
		constraint[1] = constraint[0];
	}
	// If a name is defined use the registeredValidators to pick the validation function
	if( typeof(constraint[1]) === "string" ) {
		validatorKey = constraint[1];
		constraint[1] = this.validatorRegistry.getRegisteredValidator(validatorKey);
		if( !constraint[1] ) {
			throw new Error('no validator registered as ' + validatorKey);
		}
	}
	// ensure there is a `groups` property and allow for the shorthand (note no array):
	//   { groups: 'MYGORUP' }
	// instead of:
	//   { groups: ['MYGORUP'] }
	if( constraint[2] == null ) {
		constraint[2] = {};
	}
	if( constraint[2].groups == null ) {
		constraint[2].groups = Validator.DEFAULT_GROUPS.slice();
	}
	if( typeof(constraint[2].groups) === "string" ) {
		constraint[2].groups = [constraint[2].groups];
	}
	
	return new Constraint(constraint[0], constraint[1], constraint[2]);
};

/**
 * Determine if the <code>specGroups</code> contain any of the <code>requiredGroups</code>.
 *
 * @memberof Validator
 * @private
 * @param {Constraint} constraint - The constraint that defines the groups it applies to. It is expected to be normalized, so that <code>constraint.params.groups</code> will be an array.
 * @param {string[]} requiredGroups - The required groups for this constraint to be active.
 * @returns {boolean} - If at least one of the required groups is declared in the <code>specGroups</code>.
 */
function inGroups(constraint, requiredGroups) {
	var i, specGroups = constraint.params.groups;
	for( i=0; i < specGroups.length; i++ ) {
		if( requiredGroups.indexOf(specGroups[i]) >= 0 ) return true;
	}
	return false;
}

/**
 * A registry for {@linkplain Constraint~validator validator functions}.
 *
 * @name ValidatorRegistry
 * @class
 */
/**
 * Get a registered validator.
 *
 * @method getRegisteredValidator
 *
 * @memberof ValidatorRegistry.prototype
 * @param {string} name - The name (key) of the validator.
 * @returns {Constraint~validator}
 */
/**
 * Register a validator.
 *
 * @method registerValidator
 *
 * @memberof ValidatorRegistry.prototype
 * @param {string} name - The name (key) of the validator.
 * @param {Constraint~validator} validator - The validator.
 */

/**
 * A strategy for extracting validation information and introspecting the model.
 *
 * @name IntrospectionStrategy
 * @class
 */
/**
 * Get a registered validator.
 *
 * @method extractConstraintsFromContext
 *
 * @memberof IntrospectionStrategy.prototype
 * @param {ValidationContext} vctx - The validation context.
 * @param {*} model - The model object to validate.
 * @param {string} type - Type of the object (an optional key for the validation constraints set)
 * @param {string} propertyName - Name of the property to validate.
 */
/**
 * Enumerate the properties of a model.
 *
 * @method enumerateProps
 *
 * @memberof IntrospectionStrategy.prototype
 * @param {*} model - The model object to validate.
 * @param {string} type - Type of the object (an optional key for the validation constraints set).
 * @param {ValidationContext} vctx - The validation context.
 * @param {IntrospectionStrategy~enumeratePropsCallback} callback - The function to call for each property of the <code>model</code>.
 */
/**
 * Evaluate the named property of a model.
 *
 * @method evaluate
 *
 * @memberof IntrospectionStrategy.prototype
 * @param {*} model - The model object to validate.
 * @param {string} propName - The name of the property to evaluate.
 * @param {string} type - Type of the object (an optional key for the validation constraints set).
 * @param {ValidationContext} vctx - The validation context.
 * @returns {*} - The value of the property.
 */
/**
 * Determine the type of the given property of the given parent type.
 *
 * @method findType
 *
 * @memberof IntrospectionStrategy.prototype
 * @param {ValidationContext} vctx - The validation context.
 * @param {string} parentType - Type of the object that contains the property, whose type is requested (an optional key for the validation constraints set).
 * @param {string} propName - The name of the property to evaluate.
 * @returns {string} - The type of the property.
 */

/**
 * A callback invoked with the nect property name from the <code>IntrospectionStrategy</code>,
 * may return <code>false</code> to stop the iteration recursively.
 *
 * @callback IntrospectionStrategy~enumeratePropsCallback
 * @param {string|number} propName - The name of the property or index in the current array.
 * @returns {boolean|void} - If a literal <code>false</code> is returned, the validation will exit (used to implement the <code>eager</code> flag).
 */
