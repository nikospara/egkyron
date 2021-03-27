import { ValidatorFn, ValidatorRegistry } from 'egkyron';

export default function makeValidatorRegistry(): ValidatorRegistry {
	var registry: { [key:string]: ValidatorFn<any> } = {
		nospaces: function(/* `this` is the parent object of the value */ value, _validationParameters, _validationContext) {
			return value == null || (value.indexOf(' ') < 0 && value.indexOf('\t') < 0);
		},

		length: function(/* `this` is the parent object of the value */ value, validationParameters: any, _validationContext) {
			var
				min = typeof(validationParameters.min) === 'number' ? validationParameters.min : Number.NEGATIVE_INFINITY,
				max = typeof(validationParameters.max) === 'number' ? validationParameters.max : Number.POSITIVE_INFINITY;

			return value == null || (typeof(value.length) === 'number' && value.length >= min && value.length <= max);
		}
	};

	return {
		getRegisteredValidator: (name: string) => {
			return registry[name];
		},

		registerValidator: (name: string, validator: ValidatorFn<any>) => {
			registry[name] = validator;
		}
	};
}
