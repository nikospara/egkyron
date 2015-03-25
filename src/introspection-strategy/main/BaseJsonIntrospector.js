/* exported BaseJsonIntrospector */
/**
 * A base <code>IntrospectionStrategy</code> that introspects standard JS objects.
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
 * @param {string} [enumerationMode] - How should properties be enumerated (defaults to <code>'VALIDATORS'</code>)
 *
 * @example
 *
 * function Customer(name) {
 *     this.name = name;
 * }
 *
 * Customer.validators = {
 *     name: [
 *         'required',
 *         ['regexp', { re: /[A-Z][A-Za-z]+/ }]
 *     ]
 * };
 */
function BaseJsonIntrospector(enumerationMode) {
	/**
	 * The enumeration mode, <code>'VALIDATORS'</code>, <code>'MODEL'</code>, <code>'UNION'</code>.
	 * @member {string}
	 */
	this.enumerationMode = enumerationMode || 'VALIDATORS';
}

/**
 * Enumerate the properties, taking into account the {@link #enumerationMode}.
 */
BaseJsonIntrospector.prototype.enumerateProps = function(vctx, model, type, callback) {
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
BaseJsonIntrospector.prototype.enumerateArray = function(vctx, model, type, callback) {
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
BaseJsonIntrospector.prototype.enumeratePropsFromValidators = function(vctx, model, type, callback) {
	var x, validators = this.extractValidatorsFromModel(vctx, model, type);
	for( x in validators ) {
		if( callback(x) === false ) {
			return false;
		}
	}
	return true;
};

/**
 * How are all the validators extracted from a model.
 *
 * @method extractValidatorsFromModel
 * @memberof BaseJsonIntrospector.prototype
 * @abstract
 * @protected
 *
 * @param {ValidationContext} vctx - The validation context.
 * @param {*} model - The model object to validate.
 * @param {string} type - Type of the object (an optional key for the validation constraints set).
 */

/**
 * Return the properties of the model using <code>for...in</code>.
 * @protected
 */
BaseJsonIntrospector.prototype.enumeratePropsFromModel = function(vctx, model, type, callback) {
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
BaseJsonIntrospector.prototype.enumeratePropsFromValidatorsAndModel = function(vctx, model, type, callback) {
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
BaseJsonIntrospector.prototype.evaluate = function(model, propName, type, vctx) {
	// jshint unused: false
	if( model != null ) {
		return model[propName];
	}
};
