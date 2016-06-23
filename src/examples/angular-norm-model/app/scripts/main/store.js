angular.module('app').factory('store', ['rules', function(rules) {

	var store = {
		data: {},

		normalize: xnormalize.bind(store, normalizeKnownNonArrayType),

		denormalize: xnormalize.bind(store, denormalizeKnownNonArrayType),

		reset: function() {
			this.data = {};
		}
	};


	function normalizeKnownNonArrayType(model, type) {
		// XXX This assumes that the identity property of every object is called 'key'
		var key = model.key;
		store.data[type] = (store.data[type] || {});
		store.data[type][key] = xnormalize(normalizeKnownNonArrayType, model, type);
		return key;
	}


	function denormalizeKnownNonArrayType(key, type) {
		var normalizedObject = store.data[type] && store.data[type][key] || null;
		result = normalizedObject ? xnormalize(denormalizeKnownNonArrayType, normalizedObject, type) : null;
		return result;
	}



	function xnormalize(xnormalizeKnownNonArrayType, root, type) {
		var result = {}, x;
		for( x in root ) {
			result[x] = xnormalizeInner(root[x], rules[type] && rules[type][x] && rules[type][x].type, xnormalizeKnownNonArrayType);
		}
		return result;
	}

	function xnormalizeInner(model, type, xnormalizeKnownNonArrayType) {
		return !type ? model : xnormalizeKnownType(model, type, xnormalizeKnownNonArrayType);
	}

	function xnormalizeKnownType(model, type, xnormalizeKnownNonArrayType) {
		var isArray = type.indexOf('[]') === type.length - 2;
		return isArray ? xnormalizeArrayOf(model, type.substring(0, type.length - 2), xnormalizeKnownNonArrayType) : xnormalizeKnownNonArrayType(model, type);
	}

	function xnormalizeArrayOf(array, elementType, xnormalizeKnownNonArrayType) {
		return array.map(function(element) {
			return xnormalizeKnownType(element, elementType, xnormalizeKnownNonArrayType);
		});
	}


	return store;
}]);
