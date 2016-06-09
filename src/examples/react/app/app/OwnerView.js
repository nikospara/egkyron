import React, { Component } from 'react';
import Validator from 'egkyron/Validator';
import ConstructorIntrospector from 'egkyron/introspection-strategy/ConstructorIntrospector';
import Owner from 'model/Owner';
import makeValidatorRegistry from 'model/makeValidatorRegistry';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import InputOwner from 'editors/InputOwner';

export default class OwnerView extends Component {
	constructor(props) {
		super(props);
		this.state = this._makeState(props);
	}

	_makeState(props) {
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
					<Col sm={4} smOffset={4}>
						<Button block={true} bsStyle="primary" onClick={this.submitOwner.bind(this)} disabled={isInvalid}>Submit</Button>
					</Col>
				</Row>
			</section>
		);
	}
}
