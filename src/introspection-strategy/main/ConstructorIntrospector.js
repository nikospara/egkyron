/* exported ConstructorIntrospector */
/* global BaseJsonIntrospector */
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
 * @extends {BaseJsonIntrospector}
 * @implements {IntrospectionStrategy}
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
function ConstructorIntrospector(enumerationMode) {
	/**
	 * The enumeration mode, <code>'VALIDATORS'</code>, <code>'MODEL'</code>, <code>'UNION'</code>.
	 * @member {string}
	 */
	this.enumerationMode = enumerationMode || 'VALIDATORS';
}

ConstructorIntrospector.prototype = new BaseJsonIntrospector();
ConstructorIntrospector.prototype.constructor = ConstructorIntrospector;

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
	var validators = this.extractValidatorsFromModel(null, model);
	return validators && propertyName && validators[propertyName] || [];
};

/**
 * How are all the validators extracted from a model.
 * @protected
 */
ConstructorIntrospector.prototype.extractValidatorsFromModel = function(vctx, model) {
	return model && model.constructor.validators || {};
};

/**
 * Nop.
 */
ConstructorIntrospector.prototype.findType = function(vctx, parentType, propName) {
	// jshint unused:false
	return null;
};
