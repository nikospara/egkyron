import React, { Component } from 'react';
import Owner from 'model/Owner';
import Pet from 'model/Pet';
import InputText from 'controls/InputText';
import InputAddress from './InputAddress';
import InputArray from './InputArray';
import InputPet from './InputPet';
import { attachInput, simpleShouldComponentUpdate } from 'controls/utils';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import uuid from 'uuid';

export default class InputOwner extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value || new Owner()
		};
	}

	handleChange(field, value) {
		var newValue = new Owner(this.state.value);
		newValue[field] = value;
		this.setState({
			value: newValue
		});
		this.props.onChange && this.props.onChange(newValue);
	}

	addPet() {
		return new Pet({id: uuid.v4()});
	}

	shouldComponentUpdate(nextProps, nextState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		return (
			<Row componentClass="fieldset">
				{this.props.label ?
				<Col sm={12}>
					<legend>{this.props.label}</legend>
				</Col>
				: null}
				<Col sm={6}>
					<fieldset>
						<legend>Personal data</legend>
						<InputText label="Name" {...attachInput(this, 'name')} />
					</fieldset>
				</Col>
				<Col sm={6}>
					<InputAddress label="Address" {...attachInput(this, 'address')} />
				</Col>
				<Col sm={12}>
					<InputArray label="Pets" {...attachInput(this, 'pets')} innerComponent={InputPet} add={this.addPet.bind(this)} addLabel="Add pet" />
				</Col>
			</Row>
		);
	}
}

InputOwner.propTypes = {
	value: React.PropTypes.instanceOf(Owner),
	onChange: React.PropTypes.func,
	label: React.PropTypes.string,
	validity: React.PropTypes.object
};
