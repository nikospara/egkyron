/**
 * @constructor
 * @implements {IntrospectionStrategy}
 */
function ConstructorIntrospector() {
	
}

/**
 */
ConstructorIntrospector.prototype.extractConstraintsFromContext = function(vctx, model, type, propertyName) {
	return this.extractConstraintsFromModel(model, propertyName);
};

/**
 * @protected
 */
ConstructorIntrospector.prototype.extractConstraintsFromModel = function(ctxObject, propertyName) {
	return ctxObject && propertyName && ctxObject.constructor.validators && ctxObject.constructor.validators[propertyName] || [];
};

/**
 */
ConstructorIntrospector.prototype.enumerateProps = function(vctx, model, type, callback) {
	var x;
	if( Array.isArray(model) ) {
		for( x=0; x < model.length; x++ ) {
			if( callback(x) === false ) {
				return false;
			}
		}
	}
	else {
		for( x in model ) {
			if( callback(x) === false ) {
				return false;
			}
		}
	}
	return true;
};

/**
 */
ConstructorIntrospector.prototype.evaluate = function(model, propName, type, vctx) {
	// jshint unused: false
	if( model != null ) {
		return model[propName];
	}
};

/**
 */
ConstructorIntrospector.prototype.findType = function() {
	return null;
};
