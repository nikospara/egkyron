/* exported ValidationContext */
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
	 * 	name: {
	 * 		_validity: {
	 * 			length: {...},    // a specific validator, e.g. for the string length
	 * 			nospaces: {...}   // another spacific validator, e.g. "contains no spaces"
	 * 		},
	 * 		_children: null
	 * 	},
	 * 	address: {
	 * 		_validity: {
	 * 			...
	 * 		},
	 * 		_children: { // NOTE: children is object
	 * 			street: {
	 * 				_validity: {
	 * 					...
	 * 				},
	 * 				_children: null
	 * 			},
	 * 			number: {
	 * 				_validity: {
	 * 					...
	 * 				},
	 * 				_children: null
	 * 			}
	 * 		}
	 * 	},
	 * 	pets: {
	 * 		_validity: {
	 * 			...
	 * 		},
	 * 		_children: [ // NOTE: children is array
	 * 			{ // index/key is 0 implicitly
	 * 				name: {
	 * 					...
	 * 				}
	 * 			}
	 * 		]
	 * 	}
	 * };
	 *
	 * @member {Object}
	 */
	this.result = { _validity: null, _children: null };
	/**
	 * Keep the path to the current property, so as to be able to return to the parent when <code>popPath()</code> is called.
	 * @member {Object[]}
	 */
	this.path = [this.result];
}

/**
 * Set the name of the constraint being validated.
 * <p>
 * <em>IMPLEMENTATION NOTE:</em> This did not need to be a function, but it is easier to mock this way.
 * </p>
 *
 * @param {string} constraintName - The name of the constraint being validated.
 */
ValidationContext.prototype.setCurrentConstraintName = function(constraintName) {
	this.constraintName = constraintName;
};

/**
 * Set the outcome of the validator of the current constraint.
 *
 * @param {boolean} validityFlag - Whether the constraint with the current <code>constraintName</code> is fullfilled (i.e. <code>true</code> means valid).
 */
ValidationContext.prototype.addResult = function(validityFlag) {
	// jshint unused:false

};

/**
 * Called when entering a property of an object to mark the path.
 *
 * @param {string} path - Name of the property just entered.
 */
ValidationContext.prototype.pushPath = function(path) {
	var curPath = this.path[this.path.length-1], newPath = { _validity: null, _children: null };
	if( !curPath._children ) {
		curPath._children = typeof(path) === 'number' ? [] : {};
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

/**
 * X
 *
 * @returns {boolean}
 */
ValidationContext.hasValidationErrors = function() {
	// jshint unused:false

};
