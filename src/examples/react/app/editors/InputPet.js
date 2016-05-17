import React, { Component } from 'react';
import Pet from 'model/Pet';
import Vaccination from 'model/Vaccination';
import InputText from 'controls/InputText';
import InputGender from './InputGender';
import InputArray from './InputArray';
import InputVaccination from './InputVaccination';
import { attachInput, simpleShouldComponentUpdate } from 'controls/utils';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import uuid from 'uuid';

const GENDER_OPTIONS = [
	{ id: 'M', label: 'Male' },
	{ id: 'F', label: 'Female' }
];

export default class InputPet extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value || new Pet()
		};
	}

	handleChange(field, value) {
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

	shouldComponentUpdate(nextProps, nextState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		return (
			<Row componentClass="fieldset">
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<Col sm={5}>
					<InputText   label="Name"   {...attachInput(this, 'name')} />
				</Col>
				<Col sm={5}>
					<InputText   label="Type"   {...attachInput(this, 'type')} />
				</Col>
				<Col sm={2}>
					<InputGender label="Gender" {...attachInput(this, 'gender')} options={GENDER_OPTIONS} />
				</Col>
				<Col sm={12}>
					<InputArray label="Vaccinations" {...attachInput(this, 'vaccinations')} innerComponent={InputVaccination} add={this.addVaccination.bind(this)} addLabel="Add vaccination" />
				</Col>
			</Row>
		);
	}
}

InputPet.propTypes = {
	value: React.PropTypes.instanceOf(Pet),
	onChange: React.PropTypes.func,
	label: React.PropTypes.string,
	validity: React.PropTypes.object
};
