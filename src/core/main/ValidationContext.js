/* exported ValidationContext */
/* global ValidationResult */
/**
 * The validation context carries information about the current validation, as well
 * as the validation result. It is meant to be used for a single validation.
 *
 * @constructor
 *
 * @param {*} root - The root object being validated.
 */
function ValidationContext(root) {
	/**
	 * The name of the constraint being validated, it may be useful for debugging and for the validator.
	 * @member {string}
	 */
	this.constraintName = null;
	/**
	 * A map from the model path to the results of validation for that path.
	 * It contains all paths that have been validated.
	 * <p>
	 * The <code>_validity</code> properties map the constraint key to the actual {@linkcode ValidationResult}.
	 * </p>
	 *
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
	 * 
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
	 *
	 * @member {ValidationResultNode}
	 */
	this.result = { _thisValid: true, _validity: null, _children: null };
	/**
	 * The message related to the current result, usually a string but may be anything that makes sense to the underlying message display mechanism.
	 * @member {string|any}
	 */
	this.message = null;
	/**
	 * Message parameters related to the current result.
	 * @member {object}
	 */
	this.messageParams = null;
	/**
	 * Keep the path to the current property, so as to be able to return to the parent when <code>popPath()</code> is called.
	 * @member {Object[]}
	 */
	this.path = [this.result];
	/**
	 * Keep the model objects up to the current property.
	 * @member {ValidationPathEntry[]}
	 * @private
	 */
	this._modelPath = [{ path: '', value: root }];
	/**
	 * Index of the root object in the <code>_modelPath</code> array, it
	 * is used by <code>appendParentPath()</code> and affected by both
	 * <code>prependParentPath()</code> and <code>appendParentPath()</code>.
	 * @member {number}
	 * @private
	 */
	this._modelPathRootIndex = 0;
}

/**
 * Set the name of the constraint being validated and reset the <code>message</code> and <code>messageParams</code>.
 *
 * @param {string} constraintName - The name of the constraint being validated.
 */
ValidationContext.prototype.setCurrentConstraintName = function(constraintName) {
	this.constraintName = constraintName;
	this.message = null;
	this.messageParams = null;
};

/**
 * Set the outcome of the validator of the current constraint as a {@link ValidationResult}.
 *
 * @param {boolean} validityFlag - Whether the constraint with the current <code>constraintName</code> is fullfilled (i.e. <code>true</code> means valid).
 */
ValidationContext.prototype.addResult = function(validityFlag) {
	var i, curPath, result;
	curPath = this.path[this.path.length-1];
	result = new ValidationResult(validityFlag, this.message, this.messageParams);
	if( !curPath._validity ) {
		curPath._validity = {};
	}
	curPath._validity[this.constraintName] = result;
	if( !validityFlag ) {
		curPath._thisValid = false;
		for( i=this.path.length-2; i >= 0; i-- ) {
			this.path[i]._childrenValid = false;
		}
	}
};

/**
 * Set the message related to the current result.
 *
 * @param {string} msg - The message.
 */
ValidationContext.prototype.setMessage = function(msg) {
	this.message = msg;
};

/**
 * Set the parameters for the current message.
 *
 * @param {object} params - The message parameters.
 */
ValidationContext.prototype.setMessageParams = function(params) {
	this.messageParams = params;
};

/**
 * Called when entering a property of an object to mark the path.
 *
 * @param {string} path - Name of the property just entered.
 * @param {*} value - Value of the property just entered.
 */
ValidationContext.prototype.pushPath = function(path, value) {
	var curPath = this.path[this.path.length-1], newPath = { _thisValid: true, _validity: null, _children: null };
	if( !curPath._children ) {
		curPath._children = (typeof(path) === 'number' ? [] : {});
	}
	if( typeof(curPath._childrenValid) === 'undefined' ) {
		curPath._childrenValid = true;
	}
	curPath._children[path] = newPath;
	this.path.push(newPath);
	this._modelPath.push({ path: path, value: value });
};

/**
 * Called when the validation is finished for the current property and its children.
 */
ValidationContext.prototype.popPath = function() {
	this.path.pop();
	this._modelPath.pop();
};

/**
 * Convenience method to check if this, or any path validation result passed as argument is valid.
 *
 * @param {object} [arg] - The path validation result, if left <code>null</code> or <code>undefined</code> the results of this object are checked.
 * @returns {boolean}
 */
ValidationContext.prototype.hasValidationErrors = function(arg) {
	var result = arg || this.result;

	if( result ) {
		return !result._thisValid || result._childrenValid === false;
	}
	else {
		return false;
	}
};

/**
 * Access the property names and values of the path.
 *
 * @param {number} [index] - The order of the path to get, <code>0</code> is the current path, <code>1</code> is the parent and so on.
 * @returns {ValidationPathEntry}
 */
ValidationContext.prototype.getModelPath = function(index) {
	var actualIndex = typeof index === 'number' ? index : 0;
	if( actualIndex < 0 ) {
		throw new Error('index should be positive - was: ' + index);
	}
	if( actualIndex > this._modelPath.length - 1 ) {
		throw new Error('index (' + index + ') should not exceed the depth of the model tree (' + this._modelPath.length + ')');
	}
	return this._modelPath[this._modelPath.length - actualIndex - 1];
};

/**
 * Access the parent nodes of the model node being validated.
 * This is a conveniency method and delegates to <code>getModelPath(index + 1)</code>.
 *
 * @param {number} [index] - The order of the parent to get, <code>0</code> (or falsey) is the parent, <code>1</code> is the grandparent and so on.
 * @returns {ValidationPathEntry}
 */
ValidationContext.prototype.getParent = function(index) {
	var actualIndex = typeof index === 'number' ? index : 0;
	return this.getModelPath(actualIndex + 1);
};

/**
 * Insert a {@link ValidationPathEntry} at the top of the model path hierarchy.
 *
 * @param {any} value - The model value to prepend.
 * @param {string|number} [propName] - Name (or index) of the prepended value.
 */
ValidationContext.prototype.prependParentPath = function(value, propName) {
	this._modelPath.unshift({ path: propName != null ? propName : '', value: value });
	this._modelPathRootIndex++;
};

/**
 * Append a {@link ValidationPathEntry} at the bottom of the parents model path
 * hierarchy, i.e. just before the root model node.
 *
 * @param {any} value - The model value to prepend.
 * @param {string|number} [propName] - Name (or index) of the prepended value.
 */
ValidationContext.prototype.appendParentPath = function(value, propName) {
	this._modelPath.splice(this._modelPathRootIndex, 0, { path: propName != null ? propName : '', value: value });
	this._modelPathRootIndex++;
};



/**
 * Descriptor for a piece of the validation path.
 *
 * @interface ValidationPathEntry
 */
/**
 * The name (if it is an object property) or index (if the parent is an array)
 * of this path entry.
 *
 * @var {string|number} path
 * @memberof ValidationPathEntry.prototype
 */
/**
 * The value of this path entry.
 *
 * @var {*} value
 * @memberof ValidationPathEntry.prototype
 */



/**
 * Descriptor for a piece of the validation result.
 *
 * @interface ValidationResultNode
 */
/**
 * Validity of this node, <code>true</code> if this node is valid.
 *
 * @var {boolean} _thisValid
 * @memberof ValidationResultNode.prototype
 */
/**
 * Validity of the children of this node, recursively;
 * <code>true</code> if all the children at all levels are valid.
 *
 * @var {boolean} [_childrenValid]
 * @memberof ValidationResultNode.prototype
 */
/**
 * Validity of the children of this node, recursively;
 * <code>true</code> if all the children at all levels are valid.
 *
 * @var {Object.<string, ValidationResult>} _validity
 * @memberof ValidationResultNode.prototype
 */
/**
 * Validation result nodes for the children (properties) of this model node, recursively.
 *
 * @var {Object.<string, ValidationResultNode>} [_children]
 * @memberof ValidationResultNode.prototype
 */
