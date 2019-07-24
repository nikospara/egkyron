import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import { makeMessages, simpleShouldComponentUpdate } from 'controls/utils';

export default class InputGender extends Component {

	_handlers = {
		handleChange: null
	};

	constructor(props) {
		super(props);
		this.state = this._makeState(props);
		this._handlers.handleChange = this.handleChange.bind(this);
	}

	_makeState(props) {
		return {
			value: props.value || ''
		};
	}

	handleChange(event) {
		this.setState({
			value: event.target.value || ''
		});
		this.props.onChange && this.props.onChange(event.target.value || null);
	}

	_makeOptions() {
		return [
			<option key=""></option>,
			...this.props.options.map(o => <option value={o.id} key={o.id}>{o.label}</option>)
		];
	}

	shouldComponentUpdate(nextProps, nextState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		var messages = makeMessages(this);
		var isInvalid = this.props.validity != null && this.props.validity._thisValid === false;

		return (
			<Form.Group>
				<Form.Label>{this.props.label}</Form.Label>
				<Form.Control as="select" value={this.state.value} onChange={this._handlers.handleChange} isInvalid={isInvalid}>
					{this._makeOptions()}
				</Form.Control>
				<Form.Control.Feedback type="invalid">
					{messages}
				</Form.Control.Feedback>
			</Form.Group>
		);
	}
}

InputGender.propTypes = {
	options: PropTypes.array,
	value: PropTypes.string,
	onChange: PropTypes.func,
	label: PropTypes.string,
	validity: PropTypes.object
};
