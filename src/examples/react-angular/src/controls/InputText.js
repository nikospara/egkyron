import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import { makeMessages, simpleShouldComponentUpdate } from 'controls/utils';

export default class InputText extends Component {

	_handlers = {
		handleChange: null
	};

	constructor(props) {
		super(props);
		this.state = this._makeState(props);
		this._handlers.handleChange = this.handleChange.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState(this._makeState(nextProps));
	}

	_makeState(props) {
		return {
			value: props.value || ''
		};
	}

	handleChange(event) {
		this.props.onChange && this.props.onChange(event.target.value);
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
				<Form.Control as="input" type="text" value={this.state.value} onChange={this._handlers.handleChange} isInvalid={isInvalid} />
				<Form.Control.Feedback type="invalid">
					{messages}
				</Form.Control.Feedback>
			</Form.Group>
		);
	}
}

InputText.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	label: PropTypes.string,
	validity: PropTypes.object
};
