import React, { Component } from 'react';
import Owner from 'model/Owner';
import Pet from 'model/Pet';
import InputText from 'controls/InputText';
import InputAddress from './InputAddress';
import InputArray from './InputArray';
import InputPet from './InputPet';
import { EditorComponentProps } from 'controls/utils';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import uuid from 'uuid';
import { FormControl } from 'reactive-forms/model/FormControl';
import { Editor } from 'reactive-forms/adapter/Editor';
import { FormGroup } from 'reactive-forms/model/FormGroup';
import Address from 'model/Address';

export interface InputOwnerProps extends EditorComponentProps<Owner> {
	label?: string;
}

interface InputOwnerState {
	value: Owner;
	formGrp: FormGroup;
}

export default class InputOwner extends Component<InputOwnerProps,InputOwnerState> {

	constructor(props: InputOwnerProps) {
		super(props);
		this.state = {
			value: props.value || new Owner(),
			formGrp: new FormGroup({
				name: new FormControl(),
				address: new FormControl(),
				pets: new FormControl()
			})
		};
		this.state.formGrp.setValue(this.state.value);
		this.state.formGrp.valueChanges.subscribe(value => {
			const newValue = new Owner(value);
			this.setState({
				value: newValue
			});
			this.props.onChange && this.props.onChange(newValue);
		});
		this.addPet = this.addPet.bind(this);
	}

	addPet() {
		return new Pet({id: uuid.v4()});
	}

	render() {
		return (
			<Form.Row>
				{this.props.label ?
				<Col sm={12}>
					<legend>{this.props.label}</legend>
				</Col>
				: null}
				<Col sm={6}>
					<fieldset>
						<legend>Personal data</legend>
						<Editor control={this.state.formGrp.controls.name}>{(state: EditorComponentProps<string>) => (
							<InputText label="Name" {...state} />
						)}</Editor>
					</fieldset>
				</Col>
				<Col sm={6}>
					<Editor control={this.state.formGrp.controls.address}>{(state: EditorComponentProps<Address>) => (
						<InputAddress label="Address" {...state} />
					)}</Editor>
				</Col>
				<Col sm={12}>
					<Editor control={this.state.formGrp.controls.pets}>{(state: EditorComponentProps<Pet[]>) => (
						<InputArray label="Pets" {...state} innerComponent={InputPet}
							add={this.addPet} addLabel="Add pet" removeLabel="Remove pet" />
					)}</Editor>
				</Col>
			</Form.Row>
		);
	}
}
