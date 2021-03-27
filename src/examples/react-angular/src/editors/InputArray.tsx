import React, { Component, ComponentClass } from 'react';
import { attachInput, simpleShouldComponentUpdate, EditorComponentProps } from 'controls/utils';
import Button from 'react-bootstrap/Button';

export interface InputArrayProps<V> extends EditorComponentProps<V[]> {
	label: string;
	add: () => V;
	addLabel: string;
	removeLabel: string;
	innerComponent: ComponentClass<any,any>;
}

interface InputArrayState<V> {
	value: V[];
}

export default class InputArray<V extends { id: string | null }> extends Component<InputArrayProps<V>,InputArrayState<V>> {

	private _handlers: { [key:string]: any } = {
		add: null
	};

	constructor(props: InputArrayProps<V>) {
		super(props);
		this.state = {
			value: props.value || []
		};
		this._handlers.add = this.add.bind(this);
	}

	handleChange(field: keyof V[], value: any) {
		var newValue = this.state.value.slice(0);
		newValue[field] = value;
		this._handleNewValue(newValue);
	}

	private _handleNewValue(newValue: V[]) {
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

	removeItem(item: V) {
		var index = this.state.value.indexOf(item);
		if( index >= 0 ) {
			var newValue = [...this.state.value.slice(0, index), ...this.state.value.slice(index + 1)];
			this._handleNewValue(newValue);
		}
	}

	private _renderInnerComponent(item: V, index: number) {
		return (
			<div className="input-array-row-wrapper" key={item.id || ''}>
				<this.props.innerComponent {...attachInput(this, index)} />
				<Button variant="danger" size="sm" onClick={() => this.removeItem(item)}>{this.props.removeLabel || 'Remove'}</Button>
			</div>
		);
	}

	shouldComponentUpdate(nextProps: InputArrayProps<V>, nextState: InputArrayState<V>) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		return (
			<fieldset>
				{this.props.label ? <legend>{this.props.label} <Button variant="link" onClick={this._handlers.add}>{this.props.addLabel || 'Add'}</Button></legend> : null}
				{this.props.value ? this.props.value.map(this._renderInnerComponent.bind(this)) : null}
			</fieldset>
		);
	}
}
