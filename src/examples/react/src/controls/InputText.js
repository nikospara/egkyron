import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
		var className = 'form-group' + (this.props.validity == null || this.props.validity._thisValid !== false ? '' : ' has-error');
		var messages = makeMessages(this);

		return (
			<div className={className}>
				<label>{this.props.label}</label>
				<input type="text" className="form-control" value={this.state.value} onChange={this._handlers.handleChange} />
				{messages}
			</div>
		);
	}
}

InputText.propTypes = {
	value: PropTypes.string,
	onChange: PropTypes.func,
	label: PropTypes.string,
	validity: PropTypes.object
};
