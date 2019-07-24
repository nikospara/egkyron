import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Owner from 'model/Owner';
import Pet from 'model/Pet';
import InputText from 'controls/InputText';
import InputAddress from './InputAddress';
import InputArray from './InputArray';
import InputPet from './InputPet';
import { attachInput, simpleShouldComponentUpdate } from 'controls/utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import uuid from 'uuid';

export default class InputOwner extends Component {

	_handlers = {
		addPet: null
	};

	constructor(props) {
		super(props);
		this.state = {
			value: props.value || new Owner()
		};
		this._handlers.addPet = this.addPet.bind(this);
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
			<Row>
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
					<InputArray label="Pets" {...attachInput(this, 'pets')} innerComponent={InputPet}
						add={this._handlers.addPet} addLabel="Add pet" removeLabel="Remove pet" />
				</Col>
			</Row>
		);
	}
}

InputOwner.propTypes = {
	value: PropTypes.instanceOf(Owner),
	onChange: PropTypes.func,
	label: PropTypes.string,
	validity: PropTypes.object
};
