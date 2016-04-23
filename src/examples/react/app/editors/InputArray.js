import React, { Component } from 'react';
import { attachInput } from 'controls/utils';
import Button from 'react-bootstrap/lib/Button';

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
				<Button bsStyle="danger" bsSize="xsmall" onClick={() => this.removeItem(item)}><span className="glyphicon glyphicon-remove" title="Remove"></span></Button>
			</div>
		);
	}

	render() {
		return (
			<fieldset>
				{this.props.label ? <legend>{this.props.label} <Button bsStyle="link" onClick={this.add.bind(this)}>{this.props.addLabel || 'Add'}</Button></legend> : null}
				{this.props.value.map(this._renderInnerComponent.bind(this))}
			</fieldset>
		);
	}
}

InputArray.propTypes = {
	value: React.PropTypes.array,
	onChange: React.PropTypes.func,
	label: React.PropTypes.string,
	add: React.PropTypes.func,
	addLabel: React.PropTypes.any,
	innerComponent: React.PropTypes.func.isRequired,
	validity: React.PropTypes.object
};
