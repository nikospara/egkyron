import React, { Component } from 'react';
import Address from 'model/Address';
import InputText from 'controls/InputText';
import { attachInput, simpleShouldComponentUpdate, EditorComponentProps } from 'controls/utils';

export interface InputAddressProps extends EditorComponentProps<Address> {
	label: string;
}

interface InputAddressState {
	value: Address;
}

export default class InputAddress extends Component<InputAddressProps,InputAddressState> {
	constructor(props: InputAddressProps) {
		super(props);
		this.state = {
			value: props.value || new Address()
		};
	}

	handleChange(field: keyof Address, value: Address[typeof field]) {
		var newValue = new Address(this.state.value);
		newValue[field] = value;
		this.setState({
			value: newValue
		});
		this.props.onChange && this.props.onChange(newValue);
	}

	shouldComponentUpdate(nextProps:InputAddressProps, nextState: InputAddressState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		return (
			<fieldset>
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<InputText label="Street" {...attachInput(this, 'street')} />
				<InputText label="Number" {...attachInput(this, 'number')} />
			</fieldset>
		);
	}
}
