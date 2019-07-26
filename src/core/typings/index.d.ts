export type ValidatorFn<T> = (value: any, validationParameters: Object, validationContext: ValidationContext<T>) => boolean;

/**
 * Descriptor of a constraint.
 * @constructor
 */
export class Constraint<T> {
    constructor();

    /**
     * The key of this constraint.
     * @member {string}
     */
    key: string;

    /**
     * The validator function.
     * @member {Constraint~validator}
     */
    validator: ValidatorFn<T>;

    /**
     * Any parameterizations to the validation logic. Some params are standard, i.e. handled by the infrastructure:
     * <ul>
     *   <li><code>condition</code>: A function taking the same arguments as the validator; if present it will be called
     *       <em>before</em> the validator and, if it returns <code>false</code>, will bypass calling the validator
     *       altogether. Note that it has to return a literal <code>false</code>, not a falsey value.</li>
     * </ul>
     * @member {Object}
     */
    params: any;

}

/**
 * The validation context carries information about the current validation, as well
 * as the validation result. It is meant to be used for a single validation.
 * @constructor
 * @param {*} root - The root object being validated.
 */
export class ValidationContext<T> {
    constructor(root: any);

    /**
     * The name of the constraint being validated, it may be useful for debugging and for the validator.
     * @member {string}
     */
    constraintName: string;

    /**
     * A map from the model path to the results of validation for that path.
     * It contains all paths that have been validated.
     * <p>
     * The <code>_validity</code> properties map the constraint key to the actual {@linkcode ValidationResult}.
     * </p>
     * @example
     * // for a model such as the following:
     * model = {
     * 	name: "Nikos",
     * 	address: {
     * 		street: "Alpha",
     * 		number: 3
     * 	},
     * 	pets: [
     * 		{
     * 			name: 'Sylvester'
     * 		}
     * 	]
     * };
     * // the result would look like:
     * result = {
     * 	_thisValid: true,
     * 	_childrenValid: false,
     * 	_validity: {
     * 		...
     * 	},
     * 	_children: {
     * 		name: {
     * 			_thisValid: true,
     * 			// NOTE: no _childrenValid member
     * 			_validity: {
     * 				length: {...},    // a specific validator, e.g. for the string length
     * 				nospaces: {...}   // another spacific validator, e.g. "contains no spaces"
     * 			},
     * 			_children: null
     * 		},
     * 		address: {
     * 			_thisValid: true,
     * 			_childrenValid: false,
     * 			_validity: {
     * 				...
     * 			},
     * 			_children: { // NOTE: children is object
     * 				street: {
     * 					_thisValid: true,
     * 					_validity: {
     * 						...
     * 					},
     * 					_children: null
     * 				},
     * 				number: {
     * 					_thisValid: true,
     * 					_validity: {
     * 						...
     * 					},
     * 					_children: null
     * 				}
     * 			}
     * 		},
     * 		pets: {
     * 			_validity: {
     * 				...
     * 			},
     * 			_children: [ // NOTE: children is array
     * 				{ // index/key is 0 implicitly
     * 					name: {
     * 						...
     * 					}
     * 				}
     * 			]
     * 		}
     * 	}
     * };
     * @member {ValidationResultNode}
     */
    result: ValidationResultNode<T>;

    /**
     * The message related to the current result, usually a string but may be anything that makes sense to the underlying message display mechanism.
     * @member {string|any}
     */
    message: string | any;

    /**
     * Message parameters related to the current result.
     * @member {object}
     */
    messageParams: any;

    /**
     * Keep the path to the current property, so as to be able to return to the parent when <code>popPath()</code> is called.
     * @member {Object[]}
     */
    path: any[];

    /**
     * Set the name of the constraint being validated and reset the <code>message</code> and <code>messageParams</code>.
     * @param {string} constraintName - The name of the constraint being validated.
     */
    setCurrentConstraintName(constraintName: string): void;

    /**
     * Set the outcome of the validator of the current constraint as a {@link ValidationResult}.
     * @param {boolean} validityFlag - Whether the constraint with the current <code>constraintName</code> is fullfilled (i.e. <code>true</code> means valid).
     */
    addResult(validityFlag: boolean): void;

    /**
     * Set the message related to the current result.
     * @param {string} msg - The message.
     */
    setMessage(msg: string): void;

    /**
     * Set the parameters for the current message.
     * @param {object} params - The message parameters.
     */
    setMessageParams(params: any): void;

    /**
     * Called when entering a property of an object to mark the path.
     * @param {string} path - Name of the property just entered.
     * @param {*} value - Value of the property just entered.
     */
    pushPath(path: string, value: any): void;

    /**
     * Called when the validation is finished for the current property and its children.
     */
    popPath(): void;

    /**
     * Convenience method to check if this, or any path validation result passed as argument is valid.
     * @param {object} [arg] - The path validation result, if left <code>null</code> or <code>undefined</code> the results of this object are checked.
     * @returns {boolean}
     */
    hasValidationErrors(arg?: any): boolean;

    /**
     * Access the property names and values of the path.
     * @param {number} [index] - The order of the path to get, <code>0</code> is the current path, <code>1</code> is the parent and so on.
     * @returns {ValidationPathEntry}
     */
    getModelPath(index?: number): ValidationPathEntry;

    /**
     * Access the parent nodes of the model node being validated.
     * This is a conveniency method and delegates to <code>getModelPath(index + 1)</code>.
     * @param {number} [index] - The order of the parent to get, <code>0</code> (or falsey) is the parent, <code>1</code> is the grandparent and so on.
     * @returns {ValidationPathEntry}
     */
    getParent(index?: number): ValidationPathEntry;

    /**
     * Insert a {@link ValidationPathEntry} at the top of the model path hierarchy.
     * @param {any} value - The model value to prepend.
     * @param {string|number} [propName] - Name (or index) of the prepended value.
     */
    prependParentPath(value: any, propName?: string | number): void;

    /**
     * Append a {@link ValidationPathEntry} at the bottom of the parents model path
     * hierarchy, i.e. just before the root model node.
     * @param {any} value - The model value to prepend.
     * @param {string|number} [propName] - Name (or index) of the prepended value.
     */
    appendParentPath(value: any, propName?: string | number): void;

}

/**
 * Descriptor for a piece of the validation path.
 * @interface ValidationPathEntry
 */
export interface ValidationPathEntry {
    /**
     * The name (if it is an object property) or index (if the parent is an array)
     * of this path entry.
     * @var {string|number} path
     * @memberof ValidationPathEntry.prototype
     */
    path: string | number;
    /**
     * The value of this path entry.
     * @var {*} value
     * @memberof ValidationPathEntry.prototype
     */
    value: any;
}

/**
 * Descriptor for a piece of the validation result.
 * @interface ValidationResultNode
 */
declare interface ValidationResultNode<T> {
    /**
     * Validity of this node, <code>true</code> if this node is valid.
     * @var {boolean} _thisValid
     * @memberof ValidationResultNode.prototype
     */
    _thisValid: boolean;
    /**
     * Validity of the children of this node, recursively;
     * <code>true</code> if all the children at all levels are valid.
     * @var {boolean} [_childrenValid]
     * @memberof ValidationResultNode.prototype
     */
    _childrenValid?: boolean;
    /**
     * Validity of the children of this node, recursively;
     * <code>true</code> if all the children at all levels are valid.
     * @var {Object.<string, ValidationResult>} _validity
     * @memberof ValidationResultNode.prototype
     */
    _validity: {
        [key: string]: ValidationResult;
    };
    /**
     * Validation result nodes for the children (properties) of this model node, recursively.
     * @var {Object.<string, ValidationResultNode>} [_children]
     * @memberof ValidationResultNode.prototype
     */
    _children: {
        [K in keyof T]: ValidationResultNode<T[K]>;
    };
}

/**
 * Validation result about a single constraint on a single field.
 * @constructor
 * @param {boolean} isValid - The validity flag.
 * @param {string|any} message - The message related to this result, usually a string but may be anything that makes sense to the underlying message display mechanism.
 * @param {object} [params] - Any params to format the message.
 */
export class ValidationResult {
    constructor(isValid: boolean, message: string | any, params?: any);

    /**
     * The validity flag.
     * @member {boolean}
     */
    isValid: boolean;

    /**
     * The message related to this result, usually a string but may be anything that makes sense to the underlying message display mechanism.
     * @member {string|any}
     */
    message: string | any;

    /**
     * Any params to format the message.
     * @member {object}
     */
    params: any;

}

/**
 * The core object for validation.
 * @constructor
 * @param {ValidatorRegistry} validatorRegistry - The validator registry.
 * @param {IntrospectionStrategy} IntrospectionStrategy - The constraints strategy.
 */
export class Validator {
    constructor(validatorRegistry: ValidatorRegistry, IntrospectionStrategy: IntrospectionStrategy);

    static DEFAULT_GROUPS: string[];

    /**
     * The validator registry.
     * @member {ValidatorRegistry}
     */
    validatorRegistry: ValidatorRegistry;

    /**
     * The introspection strategy.
     * @member {IntrospectionStrategy}
     */
    introspectionStrategy: IntrospectionStrategy;

    /**
     * Validate a model, optionally running only the specified groups.
     * <p>
     * This is the main entry point for the model validation.
     * </p>
     * @param {any} model - The model to validate.
     * @param {boolean} [eager] - If <code>true</code>, validation will stop at the first invalid field.
     * @param {string[]} [groups] - The groups to validate.
     * @returns {ValidationContext}
     */
    validate<T>(model: T, eager?: boolean, groups?: string[]): ValidationContext<T>;

    /**
     * Recursively validate the properties of the <code>model</code> object, optionally running only the specified groups
     * and limiting validation to the given properties.
     * @protected
     * @param {ValidationContext} vctx - The validation context.
     * @param {any} model - The object whose properties will be validated.
     * @param {string} type - The type key of the value being validated.
     * @param {boolean} [eager] - If <code>true</code>, validation will stop at the first invalid field.
     * @param {string[]} [groups] - The groups to validate.
     * @param {string[]} [props] - The properties of <code>model</code> to validate.
     * @returns {boolean} - If validation should go on.
     */
    protected validateProperties<T>(vctx: ValidationContext<T>, model: any, type: string, eager?: boolean, groups?: string[], props?: string[]): boolean;

    /**
     * Validate a value given the constraints, optionally running only the specified groups.
     * Reports the validation result in the given validation context.
     * <p>
     * This is a secondary entry point to the validation process, used to validate a single field (e.g. from the UI).
     * </p>
     * @param {ValidationContext} vctx - The validation context.
     * @param {Constraint[]} constraints - The constraints; may be <code>Constraint</code> objects or expressed in a shorthand form, e.g. a single <code>string</code> would indicate that the <code>Constraint.validator</code> should be read from an external mapping.
     * @param {Object} ctxObject - The object that contains the value being validated, will be used as <code>this</code> in the validator functions. May be <code>null</code>, if the validators do not use it.
     * @param {any} value - The value being validated.
     * @param {boolean} [eager] - If <code>true</code>, validation will stop at the first failed contstraint.
     * @param {string[]} [groups] - The groups to validate.
     */
    evaluateConstraints<T>(vctx: ValidationContext<T>, constraints: (Constraint<T>)[], ctxObject: any, value: any, eager?: boolean, groups?: string[]): void;

    /**
     * Normalize an array of constraints and cache the result.
     * @protected
     * @param {any[]} constraints - The array of constraints.
     * @returns {Constraint[]}
     */
    protected normalizeConstraints<T>(constraints: any[]): (Constraint<T>)[];

    /**
     * Normalize a constraint, possibly expressed in a shorthand form, to a
     * proper <code>Constraint</code> object. This logic can be extended or
     * overriden by implementations. The current implementation allows for
     * the following shorthands:
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
     * @protected
     * @param {any} constraint - A constraint object, possibly in shorthand form.
     * @returns {Constraint}
     */
    protected normalizeConstraint<T>(constraint: any): Constraint<T>;

}

/**
 * A registry for {@linkplain Constraint~validator validator functions}.
 * @name ValidatorRegistry
 * @interface
 */
export interface ValidatorRegistry {
    /**
     * Get a registered validator.
     * @method getRegisteredValidator
     * @memberof ValidatorRegistry.prototype
     * @param {string} name - The name (key) of the validator.
     * @returns {Constraint~validator}
     */
    getRegisteredValidator<T>(name: string): ValidatorFn<T>;
    /**
     * Register a validator.
     * @method registerValidator
     * @memberof ValidatorRegistry.prototype
     * @param {string} name - The name (key) of the validator.
     * @param {Constraint~validator} validator - The validator.
     */
    registerValidator<T>(name: string, validator: ValidatorFn<T>): void;
}

/**
 * A strategy for extracting validation information and introspecting the model.
 * @name IntrospectionStrategy
 * @interface
 */
export interface IntrospectionStrategy {
    /**
     * Extract the validity constraints for a property, given the model and, optionally, its type.
     * @method extractConstraintsFromContext
     * @memberof IntrospectionStrategy.prototype
     * @param {ValidationContext} vctx - The validation context.
     * @param {*} model - The model object to validate.
     * @param {string} type - Type of the object (an optional key for the validation constraints set)
     * @param {string} propertyName - Name of the property to validate.
     * @returns {Constraint[]|any[]} - Array of constraints in a format suitable to be passed to {@link Validator#evaluateConstraints}
     */
    extractConstraintsFromContext<T>(vctx: ValidationContext<T>, model: any, type: string, propertyName: string): (Constraint<T>)[] | any[];
    /**
     * Enumerate the properties of a model.
     * @method enumerateProps
     * @memberof IntrospectionStrategy.prototype
     * @param {ValidationContext} vctx - The validation context.
     * @param {*} model - The model object to validate.
     * @param {string} type - Type of the object (an optional key for the validation constraints set).
     * @param {IntrospectionStrategy~enumeratePropsCallback} callback - The function to call for each property of the <code>model</code>.
     */
    enumerateProps<T>(vctx: ValidationContext<T>, model: any, type: string, callback: enumeratePropsCallback): void;
    /**
     * Evaluate the named property of a model.
     * @method evaluate
     * @memberof IntrospectionStrategy.prototype
     * @param {*} model - The model object to validate.
     * @param {string} propName - The name of the property to evaluate.
     * @param {string} type - Type of the object (an optional key for the validation constraints set).
     * @param {ValidationContext} vctx - The validation context.
     * @returns {*} - The value of the property.
     */
    evaluate<T>(model: any, propName: string, type: string, vctx: ValidationContext<T>): any;
    /**
     * Determine the type of the given property of the given parent type.
     * @method findType
     * @memberof IntrospectionStrategy.prototype
     * @param {ValidationContext} vctx - The validation context.
     * @param {string} parentType - Type of the object that contains the property, whose type is requested (an optional key for the validation constraints set).
     * @param {string} propName - The name of the property to evaluate.
     * @returns {string} - The type of the property.
     */
    findType<T>(vctx: ValidationContext<T>, parentType: string, propName: string): string;
    /**
     * Optional member to decide if the validation algorithm should descend into the given property.
     * @method shouldDescend
     * @memberof IntrospectionStrategy.prototype
     * @param {*} model - The model object.
     * @param {string} propName - The name of the property to decide.
     * @param {string} type - Type of the object (an optional key for the validation constraints set).
     * @param {ValidationContext} vctx - The validation context.
     * @returns {boolean} - Whether the validation algorithm should descend into the given property.
     */
    shouldDescend?: <T>(model: any, propName: string, type: string, vctx: ValidationContext<T>) => boolean;
}

/**
 * A callback invoked with the nect property name from the <code>IntrospectionStrategy</code>,
 * may return <code>false</code> to stop the iteration recursively.
 * @callback IntrospectionStrategy~enumeratePropsCallback
 * @param {string|number} propName - The name of the property or index in the current array.
 * @returns {boolean|void} - If a literal <code>false</code> is returned, the validation will exit (used to implement the <code>eager</code> flag).
 */
export type enumeratePropsCallback = (propName: string | number)=>boolean | void;
