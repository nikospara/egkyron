import React, { Component } from 'react';
import { makeMessages, simpleShouldComponentUpdate } from 'controls/utils';

export default class InputGender extends Component {
	constructor(props) {
		super(props);
		this.state = this._makeState(props);
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
		var className = 'form-group' + (this.props.validity == null || this.props.validity._thisValid !== false ? '' : ' has-error');
		var messages = makeMessages(this);

		return (
			<div className={className}>
				<label>{this.props.label}</label>
				<select className="form-control" value={this.state.value} onChange={this.handleChange.bind(this)}>
					{this._makeOptions()}
				</select>
				{messages}
			</div>
		);
	}
}

InputGender.propTypes = {
	options: React.PropTypes.array,
	value: React.PropTypes.string,
	onChange: React.PropTypes.func,
	label: React.PropTypes.string,
	validity: React.PropTypes.object
};
