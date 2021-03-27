import React, { Component } from 'react';
import Vaccination from 'model/Vaccination';
import InputText from 'controls/InputText';
import { attachInput, simpleShouldComponentUpdate, EditorComponentProps } from 'controls/utils';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

export interface InputVaccinationProps extends EditorComponentProps<Vaccination> {
	label: string;
}

interface InputVaccinationState {
	value: Vaccination;
}

export default class InputVaccination extends Component<InputVaccinationProps,InputVaccinationState> {
	constructor(props: InputVaccinationProps) {
		super(props);
		this.state = {
			value: props.value || new Vaccination()
		};
	}

	handleChange(field: keyof Vaccination, value: Vaccination[typeof field]) {
		var newValue = new Vaccination(this.state.value);
		newValue[field] = value;
		this.setState({
			value: newValue
		});
		this.props.onChange && this.props.onChange(newValue);
	}

	shouldComponentUpdate(nextProps: InputVaccinationProps, nextState: InputVaccinationState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		return (
			<Form.Row>
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<Col sm={7}>
					<InputText label="Type" {...attachInput(this, 'type')} />
				</Col>
				<Col sm={5}>
					<InputText label="Date" {...attachInput(this, 'date')} />
				</Col>
			</Form.Row>
		);
	}
}
