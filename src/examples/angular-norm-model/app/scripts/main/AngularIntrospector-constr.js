angular.module('app').factory('AngularIntrospector', ['$parse', 'ConstructorIntrospector', function($parse, ConstructorIntrospector) {

	function findMatchingBracketBackwards(expr, index) {
		// jshint unused: false
		throw new Error('UNIMPLEMENTED, USE ONLY DOT FOR NOW!!!');
	}

	function AngularIntrospector() {
		ConstructorIntrospector.apply(this);
	}

	AngularIntrospector.prototype = new ConstructorIntrospector();
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

	AngularIntrospector.prototype.prepareValidationFromScope = function(scope, processElementResult) {
		var
			ctxObject = processElementResult.ctxGetter(scope),
			propertyName = processElementResult.propNameGetter(scope);
		
		return {
			ctxObject: ctxObject,
			constraints: this.extractConstraintsFromModel(ctxObject, propertyName),
			propertyName: propertyName
		};
	};

	return AngularIntrospector;
}]);
