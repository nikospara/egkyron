import React, { Component } from 'react';
import Address from 'model/Address';
import InputText from 'controls/InputText';
import { EditorComponentProps } from 'controls/utils';
import { FormControl } from 'reactive-forms/model/FormControl';
import { Editor } from 'reactive-forms/adapter/Editor';
import { FormGroup } from 'reactive-forms/model/FormGroup';

export interface InputAddressProps extends EditorComponentProps<Address> {
	label: string;
}

interface InputAddressState {
	value: Address;
	formGrp: FormGroup;
}

export default class InputAddress extends Component<InputAddressProps,InputAddressState> {
	constructor(props: InputAddressProps) {
		super(props);
		this.state = {
			value: props.value || new Address(),
			formGrp: new FormGroup({
				street: new FormControl(),
				number: new FormControl(),
			})
		};
		this.state.formGrp.setValue(this.state.value);
		this.state.formGrp.valueChanges.subscribe(value => {
			var newValue = new Address(value);
			this.setState({
				value: newValue
			});
			this.props.onChange && this.props.onChange(newValue);
		});
	}

	render() {
		return (
			<fieldset>
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<Editor control={this.state.formGrp.controls.street}>{(state: EditorComponentProps<string>) => (
					<InputText label="Street" {...state} />
				)}</Editor>
				<Editor control={this.state.formGrp.controls.number}>{(state: EditorComponentProps<string>) => (
					<InputText label="Number" {...state} />
				)}</Editor>
			</fieldset>
		);
	}
}
