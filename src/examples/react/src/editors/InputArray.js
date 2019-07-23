import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { attachInput, simpleShouldComponentUpdate } from 'controls/utils';
import Button from 'react-bootstrap/Button';

export default class InputArray extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value || []
		};
	}

	handleChange(field, value) {
		var newValue = this.state.value.slice(0);
		newValue[field] = value;
		this._handleNewValue(newValue);
	}

	_handleNewValue(newValue) {
		this.setState({
			value: newValue
		});
		this.props.onChange && this.props.onChange(newValue);
	}

	add() {
		var addedItem = this.props.add && this.props.add();
		if( addedItem ) {
			// we can place it wherever we want; just appending it for the time being (simplest case)
			var newValue = this.state.value.slice(0);
			newValue.push(addedItem);
			this._handleNewValue(newValue);
		}
	}

	removeItem(item) {
		var index = this.state.value.indexOf(item);
		if( index >= 0 ) {
			var newValue = [...this.state.value.slice(0, index), ...this.state.value.slice(index + 1)];
			this._handleNewValue(newValue);
		}
	}

	_renderInnerComponent(item, index) {
		return (
			<div className="input-array-row-wrapper" key={item.id}>
				<this.props.innerComponent {...attachInput(this, index)} />
				<Button variant="danger" size="sm" onClick={() => this.removeItem(item)}>{this.props.removeLabel || 'Remove'}</Button>
			</div>
		);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		return (
			<fieldset>
				{this.props.label ? <legend>{this.props.label} <Button variant="link" onClick={this.add.bind(this)}>{this.props.addLabel || 'Add'}</Button></legend> : null}
				{this.props.value.map(this._renderInnerComponent.bind(this))}
			</fieldset>
		);
	}
}

InputArray.propTypes = {
	value: PropTypes.array,
	onChange: PropTypes.func,
	label: PropTypes.string,
	add: PropTypes.func,
	addLabel: PropTypes.any,
	removeLabel: PropTypes.any,
	innerComponent: PropTypes.func.isRequired,
	validity: PropTypes.object
};
