import React, { Component } from 'react';
import { makeMessages } from 'controls/utils';

export default class InputText extends Component {
	constructor(props) {
		super(props);
		this.state = this._makeState(props);
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

	render() {
		var className = 'form-group' + (this.props.validity == null || this.props.validity._thisValid !== false ? '' : ' has-error');
		var messages = makeMessages(this);

		return (
			<div className={className}>
				<label>{this.props.label}</label>
				<input type="text" className="form-control" value={this.state.value} onChange={this.handleChange.bind(this)} />
				{messages}
			</div>
		);
	}
}

InputText.propTypes = {
	value: React.PropTypes.string,
	onChange: React.PropTypes.func,
	label: React.PropTypes.string,
	validity: React.PropTypes.object
};
