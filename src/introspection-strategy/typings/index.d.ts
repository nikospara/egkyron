import { IntrospectionStrategy, Constraint } from 'egkyron';

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
 * @constructor
 * @param {string} [enumerationMode] - How should properties be enumerated (defaults to <code>'VALIDATORS'</code>)
 * @example
 * function Customer(name) {
 *     this.name = name;
 * }
 * Customer.validators = {
 *     name: [
 *         'required',
 *         ['regexp', { re: /[A-Z][A-Za-z]+/ }]
 *     ]
 * };
 */
export abstract class BaseJsonIntrospector implements IntrospectionStrategy {
    constructor(enumerationMode?: string);

    /**
     * The enumeration mode, <code>'VALIDATORS'</code>, <code>'MODEL'</code>, <code>'UNION'</code>.
     * @member {string}
     */
    enumerationMode: string;

    /**
     * Enumerate the properties, taking into account the {@link #enumerationMode}.
     */
    enumerateProps(): void;

    /**
     * Enumerate an array.
     * @protected
     */
    protected enumerateArray(): void;

    /**
     * Return the properties that have an entry in the <code>validators</code> object.
     * @protected
     */
    protected enumeratePropsFromValidators(): void;

    /**
     * How are all the validators extracted from a model.
     * @method extractValidatorsFromModel
     * @memberof BaseJsonIntrospector.prototype
     * @abstract
     * @protected
     * @param {ValidationContext} vctx - The validation context.
     * @param {*} model - The model object to validate.
     * @param {string} type - Type of the object (an optional key for the validation constraints set).
     */
    protected abstract extractValidatorsFromModel(vctx: any, model: any, type: string): void;

    /**
     * Return the properties of the model using <code>for...in</code>.
     * @protected
     */
    protected enumeratePropsFromModel(): void;

    /**
     * Return the union of properties in the model and the <code>validators</code> object.
     * @protected
     */
    protected enumeratePropsFromValidatorsAndModel(): void;

    /**
     * Use the <code>propName</code> as index in the <code>model</code>.
     */
    evaluate(): void;

}

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
export class ConstructorIntrospector extends BaseJsonIntrospector {
    constructor(enumerationMode?: string);

    extractConstraintsFromContext(vctx: ValidationContext, model: any, type: string, propertyName: string): (Constraint)[] | any[];

    protected extractConstraintsFromModel(model: any, propertyName: string): (Constraint)[] | any[];

    protected extractValidatorsFromModel(vctx: ValidationContext, model: any, type: string): {[key in keyof model]: any};

    findType(vctx: ValidationContext, parentType: string, propName: string): string;
}

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
export class ExternalConstraintsIntrospector extends BaseJsonIntrospector {
    constructor(rules: any, rootType: string, enumerationMode?: string);

    extractConstraintsFromContext(vctx: ValidationContext, model: any, type: string, propertyName: string): (Constraint)[] | any[];

    protected extractConstraintsFromModel(model: any, propertyName: string): (Constraint)[] | any[];

    protected extractValidatorsFromModel(vctx: ValidationContext, model: any, type: string): {[key in keyof model]: any};

    findType(vctx: ValidationContext, parentType: string, propName: string): string;
}
