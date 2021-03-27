import React, { Component } from 'react';
import Vaccination from 'model/Vaccination';
import InputText from 'controls/InputText';
import { EditorComponentProps } from 'controls/utils';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { FormControl } from 'reactive-forms/model/FormControl';
import { Editor } from 'reactive-forms/adapter/Editor';
import { FormGroup } from 'reactive-forms/model/FormGroup';

export interface InputVaccinationProps extends EditorComponentProps<Vaccination> {
	label: string;
}

interface InputVaccinationState {
	value: Vaccination;
	formGrp: FormGroup;
}

export default class InputVaccination extends Component<InputVaccinationProps,InputVaccinationState> {
	constructor(props: InputVaccinationProps) {
		super(props);
		this.state = {
			value: props.value || new Vaccination(),
			formGrp: new FormGroup({
				type: new FormControl(),
				date: new FormControl(),
			})
		};
		this.state.formGrp.valueChanges.subscribe(value => {
			var newValue = new Vaccination(Object.assign({}, this.state.value, value));
			this.setState({
				value: newValue
			});
			this.props.onChange && this.props.onChange(newValue);
		});
	}

	render() {
		return (
			<Form.Row>
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<Col sm={7}>
					<Editor control={this.state.formGrp.controls.type}>{(state: EditorComponentProps<string>) => (
						<InputText label="Type" {...state} />
					)}</Editor>
				</Col>
				<Col sm={5}>
					<Editor control={this.state.formGrp.controls.date}>{(state: EditorComponentProps<string>) => (
						<InputText label="Date" {...state} />
					)}</Editor>
				</Col>
			</Form.Row>
		);
	}
}
