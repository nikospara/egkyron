/**
 * An <code>IntrospectionStrategy</code> that extracts information from standard JS objects.
 * The constructor is expected to have a property <code>validators</code> that defines the
 * validators for each property of the model.
 * <p>
 * The properties of a model are enumerated using 3 possible strategies:
 * <ol>
 *   <li>Return the properties defined by the <code>validators</code> property; if a property is
 *       undefined in the model, the validators still apply; if a property is not defined in the
 *       <code>validators</code> (even having no validators - an empty array or <code>null</code>),
 *       it will be ignored. This is the default, key <code>'VALIDATORS'</code>.</li>
 *   <li>Return the properties of the model. If a property that should be validated (e.g. "required")
 *       is not present in the model, it will not be validated. Key <code>'MODEL'</code>.</li>
 *   <li>Return the union of the two previous methods. Key <code>'UNION'</code>.</li>
 * </p>
 *
 * @constructor
 * @implements {IntrospectionStrategy}
 * @param {string} [enumerationMode] - How should properties be enumerated (defaults to <code>'VALIDATORS'</code>)
 *
 * @example
 *
 * function Customer(name) {
 *     this.name;
 * }
 *
 * Customer.validators = {
 *     name: [
 *         'required',
 *         ['regexp', { re: /[A-Z][A-Za-z]+/ }]
 *     ]
 * };
 */
function ConstructorIntrospector(enumerationMode) {
	/**
	 * The enumeration mode, <code>'VALIDATORS'</code>, <code>'MODEL'</code>, <code>'UNION'</code>.
	 * @member {string}
	 */
	this.enumerationMode = enumerationMode || 'VALIDATORS';
}

/**
 *
 */
ConstructorIntrospector.prototype.extractConstraintsFromContext = function(vctx, model, type, propertyName) {
	return this.extractConstraintsFromModel(model, propertyName);
};

/**
 * This is the main logic of retrieving the constraints for a property of the model.
 * @protected
 */
ConstructorIntrospector.prototype.extractConstraintsFromModel = function(model, propertyName) {
	var validators = this.extractValidatorsFromModel(model);
	return validators && propertyName && validators[propertyName] || [];
};

/**
 * How are all the validators extracted from a model.
 * @protected
 */
ConstructorIntrospector.prototype.extractValidatorsFromModel = function(model) {
	return model && model.constructor.validators || {};
};

/**
 * Enumerate the properties, taking into account the {@link #enumerationMode}.
 */
ConstructorIntrospector.prototype.enumerateProps = function(vctx, model, type, callback) {
	if( Array.isArray(model) ) {
		return this.enumerateArray(vctx, model, type, callback);
	}
	else {
		switch( this.enumerationMode ) {
			case 'VALIDATORS':
				return this.enumeratePropsFromValidators(vctx, model, type, callback);
			case 'MODEL':
				return this.enumeratePropsFromModel(vctx, model, type, callback);
			case 'UNION':
				return this.enumeratePropsFromValidatorsAndModel(vctx, model, type, callback);
			default:
				throw new Error('unrecognized enumerationMode: ' + this.enumerationMode);
		}
	}
};

/**
 * Enumerate an array.
 * @protected
 */
ConstructorIntrospector.prototype.enumerateArray = function(vctx, model, type, callback) {
	var i;
	for( i=0; i < model.length; i++ ) {
		if( callback(i) === false ) {
			return false;
		}
	}
	return true;
};

/**
 * Return the properties that have an entry in the <code>validators</code> object.
 * @protected
 */
ConstructorIntrospector.prototype.enumeratePropsFromValidators = function(vctx, model, type, callback) {
	var x, validators = this.extractValidatorsFromModel(model);
	for( x in validators ) {
		if( callback(x) === false ) {
			return false;
		}
	}
	return true;
};

/**
 * Return the properties of the model using <code>for...in</code>.
 * @protected
 */
ConstructorIntrospector.prototype.enumeratePropsFromModel = function(vctx, model, type, callback) {
	var x;
	for( x in model ) {
		if( callback(x) === false ) {
			return false;
		}
	}
	return true;
};

/**
 * Return the union of properties in the model and the <code>validators</code> object.
 * @protected
 */
ConstructorIntrospector.prototype.enumeratePropsFromValidatorsAndModel = function(vctx, model, type, callback) {
	var x, unionObj = {};

	function collectPropNamesCb(propName) {
		unionObj[propName] = true;
	}

	this.enumeratePropsFromValidators(vctx, model, type, collectPropNamesCb);
	this.enumeratePropsFromModel(vctx, model, type, collectPropNamesCb);

	for( x in unionObj ) {
		if( callback(x) === false ) {
			return false;
		}
	}
	return true;
};

/**
 * Use the <code>propName</code> as index in the <code>model</code>.
 */
ConstructorIntrospector.prototype.evaluate = function(model, propName, type, vctx) {
	// jshint unused: false
	if( model != null ) {
		return model[propName];
	}
};

/**
 * Nop.
 */
ConstructorIntrospector.prototype.findType = function() {
	return null;
};
