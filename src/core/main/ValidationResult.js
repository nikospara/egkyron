/* exported ValidationResult */
/**
 * Validation result about a single constraint on a single field.
 *
 * @constructor
 *
 * @param {boolean} isValid - The validity flag.
 * @param {string|any} message - The message related to this result, usually a string but may be anything that makes sense to the underlying message display mechanism.
 * @param {object} [params] - Any params to format the message.
 */
function ValidationResult(isValid, message, params) {
	/**
	 * The validity flag.
	 * @member {boolean}
	 */
	this.isValid = !!isValid;
	/**
	 * The message related to this result, usually a string but may be anything that makes sense to the underlying message display mechanism.
	 * @member {string|any}
	 */
	this.message = message;
	/**
	 * Any params to format the message.
	 * @member {object}
	 */
	this.params = params;
}
