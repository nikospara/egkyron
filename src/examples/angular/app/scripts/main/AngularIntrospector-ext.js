angular.module('app').factory('AngularIntrospector', ['$parse', 'validatorRegistry', 'ExternalConstraintsIntrospector', function($parse, validatorRegistry, ExternalConstraintsIntrospector) {

	function findMatchingBracketBackwards(expr, index) {
		// jshint unused: false
		throw new Error('UNIMPLEMENTED, USE ONLY DOT FOR NOW!!!');
	}

	function AngularIntrospector(rules, rootType) {
		ExternalConstraintsIntrospector.call(this, rules, rootType);
	}

	AngularIntrospector.prototype = new ExternalConstraintsIntrospector();
	AngularIntrospector.prototype.constructor = AngularIntrospector;

	AngularIntrospector.prototype.processModelExpression = function(modelExpression) {
		var
			indexDot = modelExpression.lastIndexOf("."),
			indexBracket = modelExpression.lastIndexOf("]"),
			isDot = (indexDot >= indexBracket),
			index = (isDot ? indexDot : findMatchingBracketBackwards(modelExpression, indexBracket)),
			ret;

		if( index <= 0 ) throw new Error("cannot validate model expression: " + modelExpression);
		if( index === modelExpression.length-1 ) throw new Error("prop name not specified: " + modelExpression);

		ret = {
			ctx: modelExpression.substring(0,index),
			prop: isDot ? "'" + modelExpression.substring(index+1) + "'" : modelExpression.substring(index+1, indexBracket)
		};

		ret.ctxGetter = $parse(ret.ctx);
		ret.propNameGetter = $parse(ret.prop);

		return ret;
	};

	AngularIntrospector.prototype.prepareValidationFromScope = function(scope, processElementResult, type) {
		var
			ctxObject = processElementResult.ctxGetter(scope),
			propertyName = processElementResult.propNameGetter(scope);
		
		return {
			ctxObject: ctxObject,
			constraints: this.extractConstraintsFromModel(ctxObject, propertyName, type),
			propertyName: propertyName
		};
	};

	return AngularIntrospector;
}]);
