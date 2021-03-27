import React, { Component } from 'react';
import Pet from 'model/Pet';
import Vaccination from 'model/Vaccination';
import InputText from 'controls/InputText';
import InputGender from './InputGender';
import InputArray from './InputArray';
import InputVaccination from './InputVaccination';
import { attachInput, simpleShouldComponentUpdate, EditorComponentProps } from 'controls/utils';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import uuid from 'uuid';

const GENDER_OPTIONS = [
	{ id: 'M', label: 'Male' },
	{ id: 'F', label: 'Female' }
];

export interface InputPetProps extends EditorComponentProps<Pet> {
	label: string;
}

interface InputPetState {
	value: Pet;
}

export default class InputPet extends Component<InputPetProps,InputPetState> {

	private _handlers: { [key:string]: any } = {
		addVaccination: null
	};

	constructor(props: InputPetProps) {
		super(props);
		this.state = {
			value: props.value || new Pet()
		};
		this._handlers.addVaccination = this.addVaccination.bind(this);
	}

	handleChange(field: keyof Pet, value: any) {
		var newValue = new Pet(this.state.value);
		newValue[field] = value;
		this.setState({
			value: newValue
		});
		this.props.onChange && this.props.onChange(newValue);
	}

	addVaccination() {
		return new Vaccination({id: uuid.v4()});
	}

	shouldComponentUpdate(nextProps: InputPetProps, nextState: InputPetState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		return (
			<Form.Row>
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<Col sm={5}>
					<InputText   label="Name"         {...attachInput(this, 'name')} />
				</Col>
				<Col sm={5}>
					<InputText   label="Type"         {...attachInput(this, 'type')} />
				</Col>
				<Col sm={2}>
					<InputGender label="Gender"       {...attachInput(this, 'gender')} options={GENDER_OPTIONS} />
				</Col>
				<Col sm={12}>
					<InputArray  label="Vaccinations" {...attachInput(this, 'vaccinations')} innerComponent={InputVaccination}
						add={this._handlers.addVaccination} addLabel="Add vaccination" removeLabel="Remove vaccination" />
				</Col>
			</Form.Row>
		);
	}
}
