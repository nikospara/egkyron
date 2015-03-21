angular.module('validation').factory('Constraint', [function() {


/* exported Constraint */
/**
 * Descriptor of a constraint.
 *
 * @constructor
 */
function Constraint(key, validator, params) {
	/**
	 * The key of this constraint.
	 * @member {string}
	 */
	this.key = key;
	/**
	 * The validator function.
	 * @member {Constraint~validator}
	 */
	this.validator = validator;
	/**
	 * Any parameterizations to the validation logic.
	 * @member {Object}
	 */
	this.params = params;
}

/**
 * A validator function. Called with <code>this</code> pointing to the object containing the value being validated.
 *
 * @callback Constraint~validator
 * @param {any} value - The value to validate.
 * @param {Object} validationParameters - The validation parameters.
 * @param {ValidationContext} validationContext - The validation context.
 * @returns {boolean} - The validity flag, <code>true</code> if the value is valid.
 */

return Constraint;
}]);
