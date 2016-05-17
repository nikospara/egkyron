import React, { Component } from 'react';
import Address from 'model/Address';
import InputText from 'controls/InputText';
import { attachInput, simpleShouldComponentUpdate } from 'controls/utils';

export default class InputAddress extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value || new Address()
		};
	}

	handleChange(field, value) {
		var newValue = new Address(this.state.value);
		newValue[field] = value;
		this.setState({
			value: newValue
		});
		this.props.onChange && this.props.onChange(newValue);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		return (
			<fieldset>
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<InputText label="Street" {...attachInput(this, 'street')} />
				<InputText label="Number" {...attachInput(this, 'number')} />
			</fieldset>
		);
	}
}

InputAddress.propTypes = {
	value: React.PropTypes.instanceOf(Address),
	onChange: React.PropTypes.func,
	label: React.PropTypes.string,
	validity: React.PropTypes.object
};
