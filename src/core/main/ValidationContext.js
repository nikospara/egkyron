/* exported ValidationContext */
/* global ValidationResult */
/**
 * The validation context carries information about the current validation, as well
 * as the validation result. It is meant to be used for a single validation.
 *
 * @constructor
 */
function ValidationContext() {
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
	 * @member {Object}
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
 */
ValidationContext.prototype.pushPath = function(path) {
	var curPath = this.path[this.path.length-1], newPath = { _thisValid: true, _validity: null, _children: null };
	if( !curPath._children ) {
		curPath._children = (typeof(path) === 'number' ? [] : {});
	}
	if( typeof(curPath._childrenValid) === 'undefined' ) {
		curPath._childrenValid = true;
	}
	curPath._children[path] = newPath;
	this.path.push(newPath);
};

/**
 * Called when the validation is finished for the current property and its children.
 */
ValidationContext.prototype.popPath = function() {
	this.path.pop();
};
