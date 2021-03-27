import React, { Component } from 'react';
import Pet from 'model/Pet';
import Vaccination from 'model/Vaccination';
import InputText from 'controls/InputText';
import InputGender from './InputGender';
import InputArray from './InputArray';
import InputVaccination from './InputVaccination';
import { EditorComponentProps } from 'controls/utils';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import uuid from 'uuid';
import { FormControl } from 'reactive-forms/model/FormControl';
import { Editor } from 'reactive-forms/adapter/Editor';
import { FormGroup } from 'reactive-forms/model/FormGroup';

const GENDER_OPTIONS = [
	{ id: 'M', label: 'Male' },
	{ id: 'F', label: 'Female' }
];

export interface InputPetProps extends EditorComponentProps<Pet> {
	label: string;
}

interface InputPetState {
	value: Pet;
	formGrp: FormGroup;
}

export default class InputPet extends Component<InputPetProps,InputPetState> {

	constructor(props: InputPetProps) {
		super(props);
		this.state = {
			value: props.value || new Pet(),
			formGrp: new FormGroup({
				id: new FormControl(),
				name: new FormControl(),
				type: new FormControl(),
				gender: new FormControl(),
				vaccinations: new FormControl()
			})
		};
		this.state.formGrp.setValue(this.state.value);
		this.state.formGrp.valueChanges.subscribe(value => {
			var newValue = new Pet(value);
			this.setState({
				value: newValue
			});
			this.props.onChange && this.props.onChange(newValue);
		});
		this.addVaccination = this.addVaccination.bind(this);
	}

	addVaccination() {
		return new Vaccination({id: uuid.v4()});
	}

	render() {
		return (
			<Form.Row>
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<Col sm={5}>
					<Editor control={this.state.formGrp.controls.name}>{(state: EditorComponentProps<string>) => (
						<InputText   label="Name"         {...state} />
					)}</Editor>
				</Col>
				<Col sm={5}>
					<Editor control={this.state.formGrp.controls.type}>{(state: EditorComponentProps<string>) => (
						<InputText   label="Type"         {...state} />
					)}</Editor>
				</Col>
				<Col sm={2}>
					{/*
					<Editor control={this.state.formGrp.controls.gender}>{(state: EditorComponentProps<string>) => (
						<InputGender label="Gender"       {...state} options={GENDER_OPTIONS} />
					)}</Editor>
					*/}
				</Col>
				<Col sm={12}>
					<Editor control={this.state.formGrp.controls.vaccinations}>{(state: EditorComponentProps<Vaccination[]>) => (
						<InputArray  label="Vaccinations" {...state} innerComponent={InputVaccination}
							add={this.addVaccination} addLabel="Add vaccination" removeLabel="Remove vaccination" />
					)}</Editor>
				</Col>
			</Form.Row>
		);
	}
}
