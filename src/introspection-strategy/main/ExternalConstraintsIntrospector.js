/* exported ExternalConstraintsIntrospector */
/* global BaseJsonIntrospector */
/**
 * An <code>IntrospectionStrategy</code> that introspects standard JS objects, but extracts
 * the validators from an external map.
 *
 * <h3>Validation rules format</h3>
 * <p>
 * TODO
 * </p>
 *
 * @constructor
 * @implements {IntrospectionStrategy}
 * @param {object} rules - The validation rules object as described above
 * @param {string} rootType - The root type to validatel; it is returned from {@link #findType} when both
 *                            <code>parentType</code> and <code>propName</code> are <code>null</code>
 * @param {string} [enumerationMode] - How should properties be enumerated (defaults to <code>'VALIDATORS'</code>)
 *
 * @example
 *
 * function Customer() {
 *     this.name = ...;
 *     this.address = ...;
 * }
 *
 * var rules = {
 *     Customer: {
 *         name: [
 *             'required',
 *             ['regexp', { re: /[A-Z][A-Za-z]+/ }]
 *         ],
 *         address: {
 *             type: 'Address',
 *             validators: [
 *                 'required',
 *                 'address'
 *             ]
 *         }
 *     }
 * };
 */
function ExternalConstraintsIntrospector(rules, rootType, enumerationMode) {
	/**
	 * The configured validation rules.
	 * @member {string}
	 */
	this.rules = rules;
	/**
	 * The root type to validate.
	 * @member {string}
	 */
	this.rootType = rootType;
	/**
	 * The enumeration mode, <code>'VALIDATORS'</code>, <code>'MODEL'</code>, <code>'UNION'</code>.
	 * @member {string}
	 */
	this.enumerationMode = enumerationMode || 'VALIDATORS';
}

ExternalConstraintsIntrospector.prototype = new BaseJsonIntrospector();
ExternalConstraintsIntrospector.prototype.constructor = ExternalConstraintsIntrospector;

/**
 *
 */
ExternalConstraintsIntrospector.prototype.extractConstraintsFromContext = function(vctx, model, type, propertyName) {
	var ruleObj;
	if( !this.rules ) {
		throw new Error('unspecified rules');
	}
	ruleObj = type && this.rules[type];
	return determineValidatorsFromRuleObjectProperty(ruleObj && propertyName && ruleObj[propertyName]);
};

/**
 * Determine the validators array from several configuration alternatives.
 */
function determineValidatorsFromRuleObjectProperty(ruleObjectProperty) {
	var result;
	if( ruleObjectProperty == null ) {
		result = [];
	}
	else if( typeof(ruleObjectProperty) === 'string' ) {
		// allow a single validator to be referenced by name:
		//   "propName": "validatorName"
		result = [ruleObjectProperty];
	}
	else if( Array.isArray(ruleObjectProperty) ) {
		// allow direct definition of validators array:
		//   "propName": [ ...validators... ]
		result = ruleObjectProperty;
	}
	else if( ruleObjectProperty.validators ) {
		// allow object configuration as:
		//   "propName": { ... }
		if( typeof(ruleObjectProperty.validators) === 'string' ) {
			// allow the `validators` property to be a string:
			//   "propName": {
			//     "validators": "validatorName",
			//     ...
			//   }
			result = [ruleObjectProperty.validators];
		}
		else if( Array.isArray(ruleObjectProperty.validators) ) {
			// allow the `validators` property to be validators array:
			//   "propName": {
			//     "validators": [ ...validators... ],
			//     ...
			//   }
			result = ruleObjectProperty.validators;
		}
		else {
			throw new Error('unrecognized ruleObjectProperty.validators: ' + ruleObjectProperty.validators);
		}
	}
	else {
		result = [];
	}
	return result;
}

/**
 * This is the main logic of retrieving the constraints for a property of the model.
 * @protected
 */
ExternalConstraintsIntrospector.prototype.extractConstraintsFromModel = function(model, propertyName, type) {
	var
		validators = this.extractValidatorsFromModel(null, model, type),
		validatorProp = validators && propertyName && validators[propertyName];
	return determineValidatorsFromRuleObjectProperty(validatorProp);
};

/**
 * How are all the validators extracted from a model.
 * @protected
 */
ExternalConstraintsIntrospector.prototype.extractValidatorsFromModel = function(vctx, model, type) {
	if( !this.rules ) {
		throw new Error('unspecified rules');
	}
	return type && this.rules[type] || {};
};

/**
 * Extract the type of the named property from the <code>type</code> property of
 * the validator object, correctly handling arrays.
 */
ExternalConstraintsIntrospector.prototype.findType = function(vctx, parentType, propName) {
	var type = null, rule;
	if( !this.rules ) {
		throw new Error('unspecified rules');
	}
	if( parentType ) {
		if( parentType.indexOf('[]') === parentType.length-2 ) {
			// array of things
			type = parentType.substring(0, parentType.length-2);
		}
		else {
			rule = this.rules[parentType] && this.rules[parentType][propName] || null;
			if( rule && typeof(rule.type) === 'string' ) {
				type = rule.type;
			}
		}
	}
	else if( propName == null ) {
		type = this.rootType;
	}
	return type;
};
