import React from 'react';
import ValidationContext from 'egkyron/ValidationContext';
import ValidationResultNode from 'egkyron/ValidationResultNode';

export interface EditorComponentProps<V> {
	value: V | null;
	onChange: (value: V | null) => void;
	validity?: ValidationResultNode<any>;
}

export interface AttachableComponent<V> {
	props: EditorComponentProps<V>;
	state: { value: V | null };
	handleChange: (fieldName: keyof V, value: any) => void;
}

export function attachInput<V, K extends keyof V>(component: AttachableComponent<V>, fieldName: K): EditorComponentProps<V[K]> {
	return {
		value: component.state.value ? component.state.value[fieldName] : null,
		onChange: component.handleChange.bind(component, fieldName),
		validity: component.props.validity && component.props.validity._children ? component.props.validity._children[fieldName] : ({} as any)
	};
}

export function makeMessages<V>(component: { props: EditorComponentProps<V> }) {
	if( !component.props.validity || !component.props.validity._validity ) {
		return null;
	}
	const validity = component.props.validity._validity; 
	return Object.getOwnPropertyNames(validity)
		.reduce((messages, validatorKey) => (
			validity[validatorKey].isValid === false ? [...messages, <div className="validation-message-block" key={validatorKey}>{validatorKey}</div>] : messages
		), [] as JSX.Element[]);
}

export function isTotallyValid(props: { validity?: ValidationResultNode<any> }) {
	return props.validity == null || !ValidationContext.prototype.hasValidationErrors(props.validity);
}

export function simpleShouldComponentUpdate(this: { props: { validity?: ValidationResultNode<any> }, state: { value: any } }, nextProps: { validity?: ValidationResultNode<any> }, nextState: { value: any }) {
	if( this.state.value === nextState.value && isTotallyValid(this.props) && isTotallyValid(nextProps) ) {
		return false;
	}
	return true;
}
