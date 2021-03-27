import React, { Component } from 'react';
import Validator from 'egkyron/Validator';
import ValidationResultNode from 'egkyron/ValidationResultNode';
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

interface OwnerViewState {
	value: Owner;
	validator: Validator;
	validity: ValidationResultNode<any>
}

export default class OwnerView extends Component<{}, OwnerViewState> {

	private _handlers: { [key:string]: any } = {
		onModelChange: null,
		submitOwner: null
	};

	constructor(props: {}) {
		super(props);
		this.state = this._makeState();
		this._handlers.onModelChange = this.onModelChange.bind(this);
		this._handlers.submitOwner = this.submitOwner.bind(this);
	}

	_makeState(): OwnerViewState {
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

	onModelChange(value: Owner) {
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
				<form autoComplete="off" noValidate={true}>
					<InputOwner value={this.state.value} onChange={this._handlers.onModelChange} validity={this.state.validity} />
				</form>
				<Row>
					<Col sm={BUTTON_SPAN}>
						<Button block={true} variant="primary" onClick={this._handlers.submitOwner} disabled={isInvalid}>Submit</Button>
					</Col>
				</Row>
			</section>
		);
	}
}
