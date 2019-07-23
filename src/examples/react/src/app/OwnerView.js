import React, { Component } from 'react';
import Validator from 'egkyron/Validator';
import ConstructorIntrospector from 'egkyron/introspection-strategy/ConstructorIntrospector';
import Owner from 'model/Owner';
import makeValidatorRegistry from 'model/makeValidatorRegistry';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import InputOwner from 'editors/InputOwner';

const BUTTON_SPAN = Object.freeze({
	span: 4,
	offset: 4
});

export default class OwnerView extends Component {
	constructor(props) {
		super(props);
		this.state = this._makeState();
	}

	_makeState() {
		var validator, value;
		// create an Egkyron Validator
		validator = new Validator(makeValidatorRegistry(), new ConstructorIntrospector());
		value = new Owner();
		return {
			value,
			// keep the validator in our state...
			validator,
			// and calculate the initial validation state
			validity: validator.validate(value).result
		};
	}

	onModelChange(value) {
console.log('new model: ', value);
		this.setState({
			value,
			// when the model changes, update the validity state
			validity: this.state.validator.validate(value).result
		});
	}

	submitOwner() {
console.log('VALUE:', this.state.value);
	}
				
	render() {
		var isInvalid = this.state.validity._thisValid === false || this.state.validity._childrenValid === false;

		return (
			<section className="owner-view">
				<h2>Owner</h2>
				<form autoComplete="off" noValidate="novalidate">
					<InputOwner value={this.state.value} onChange={this.onModelChange.bind(this)} validity={this.state.validity} />
				</form>
				<Row>
					<Col sm={BUTTON_SPAN}>
						<Button block={true} variant="primary" onClick={this.submitOwner.bind(this)} disabled={isInvalid}>Submit</Button>
					</Col>
				</Row>
			</section>
		);
	}
}
