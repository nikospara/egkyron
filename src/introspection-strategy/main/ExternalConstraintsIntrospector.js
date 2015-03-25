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
function ExternalConstraintsIntrospector(rules, enumerationMode) {
	/**
	 * The configured validation rules.
	 * @member {string}
	 */
	this.rules = rules;
	/**
	 * The enumeration mode, <code>'VALIDATORS'</code>, <code>'MODEL'</code>, <code>'UNION'</code>.
	 * @member {string}
	 */
	this.enumerationMode = enumerationMode || 'VALIDATORS';
}

ExternalConstraintsIntrospector.prototype = new BaseJsonIntrospector();
ExternalConstraintsIntrospector.prototype.constructor = ExternalConstraintsIntrospector;
