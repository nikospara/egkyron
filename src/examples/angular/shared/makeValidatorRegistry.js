function makeValidatorRegistry() {
	var registry = {
		nospaces: function(/* `this` is the parent object of the value */ value, validationContext, validationParameters) {
			return value == null || (value.indexOf(' ') < 0 && value.indexOf('\t') < 0);
		},

		length: function(/* `this` is the parent object of the value */ value, validationContext, validationParameters) {
			var
				min = typeof(validationParameters.min) === 'number' ? validationParameters.min : Number.NEGATIVE_INFINITY,
				max = typeof(validationParameters.max) === 'number' ? validationParameters.max : Number.POSITIVE_INFINITY;

			return value == null || (typeof(value.length) === 'number' && value.length >= min && value.length <= max);
		}
	};

	return {
		getRegisteredValidator: function(name) {
			return registry[name];
		}
	};
}
