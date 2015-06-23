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
	 * Any parameterizations to the validation logic. Some params are standard, i.e. handled by the infrastructure:
	 * <ul>
	 *   <li><code>condition</code>: A function taking the same arguments as the validator; if present it will be called
	 *       <em>before</em> the validator and, if it returns <code>false</code>, will bypass calling the validator
	 *       altogether. Note that it has to return a literal <code>false</code>, not a falsey value.</li>
	 * </ul>
	 *
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
