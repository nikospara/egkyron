/// <reference types="react-scripts" />

declare module 'egkyron/Validator' {
	import { Validator } from 'egkyron';
	export = Validator;
}

declare module 'egkyron/ValidationResultNode' {
	import { ValidationResultNode } from 'egkyron';
	export = ValidationResultNode;
}

declare module 'egkyron/ValidationResult' {
	import { ValidationResult } from 'egkyron';
	export = ValidationResult;
}

declare module 'egkyron/ValidationContext' {
	import { ValidationContext } from 'egkyron';
	export = ValidationContext;
}

declare module 'egkyron/introspection-strategy/ConstructorIntrospector' {
	import { ConstructorIntrospector } from 'egkyron/introspection-strategy';
	export = ConstructorIntrospector;
}
