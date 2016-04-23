import React from 'react';

export function attachInput(component, fieldName) {
	return {
		value: component.state.value ? component.state.value[fieldName] : null,
		onChange: component.handleChange.bind(component, fieldName),
		validity: component.props.validity && component.props.validity._children ? component.props.validity._children[fieldName] : {}
	};
}

export function makeMessages(component) {
	return (!component.props.validity || !component.props.validity._validity) ? null : Object.getOwnPropertyNames(component.props.validity._validity)
		.map(x => [x, component.props.validity._validity[x]])
		.filter(m => m[1].isValid === false)
		.map(m => <span className="help-block" key={m[0]}>{m[0]}</span>)
	;
}
