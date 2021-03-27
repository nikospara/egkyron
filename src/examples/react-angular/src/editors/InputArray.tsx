import React, { Component, ComponentClass } from 'react';
import { EditorComponentProps } from 'controls/utils';
import Button from 'react-bootstrap/Button';
import { FormControl } from 'reactive-forms/model/FormControl';
import { Editor } from 'reactive-forms/adapter/Editor';
import { FormArray } from 'reactive-forms/model/FormArray';

export interface InputArrayProps<V> extends EditorComponentProps<V[]> {
	label: string;
	add: () => V;
	addLabel: string;
	removeLabel: string;
	innerComponent: ComponentClass<any,any>;
}

interface InputArrayState<V> {
	value: V[];
	formArray: FormArray;
}

export default class InputArray<V extends { id: string | null }> extends Component<InputArrayProps<V>,InputArrayState<V>> {

	constructor(props: InputArrayProps<V>) {
		super(props);
		const value = props.value || [];
		const controls = value.map(item => {
			const control = new FormControl();
			control.setValue(item);
			return control;
		});
		this.state = {
			value,
			formArray: new FormArray(controls)
		};
		this.state.formArray.valueChanges.subscribe(value => {
			this.setState({
				value: value
			});
			this.props.onChange && this.props.onChange(value);
		});
		this.add = this.add.bind(this);
	}

	add() {
		var addedItem = this.props.add && this.props.add();
		if( addedItem ) {
			// we can place it wherever we want; just appending it for the time being (simplest case)
			var newValue = this.state.value.slice(0);
			newValue.push(addedItem);
			this.state.formArray.insert(newValue.length - 1, new FormControl(addedItem));
			this.state.formArray.setValue(newValue);
		}
	}

	removeItem(item: V) {
		var index = this.state.value.indexOf(item);
		if( index >= 0 ) {
			var newValue = [...this.state.value.slice(0, index), ...this.state.value.slice(index + 1)];
			this.setState({
				value: newValue
			});
			this.state.formArray.removeAt(index);
			this.state.formArray.setValue(newValue);
		}
	}

	private _renderInnerComponent(item: V, index: number) {
		return (
			<div className="input-array-row-wrapper" key={item.id || ''}>
				<Editor control={this.state.formArray.at(index)}>{(state: EditorComponentProps<V>) => (
					<this.props.innerComponent {...state} />
				)}</Editor>
				<Button variant="danger" size="sm" onClick={() => this.removeItem(item)}>{this.props.removeLabel || 'Remove'}</Button>
			</div>
		);
	}

	render() {
		return (
			<fieldset>
				{this.props.label ? <legend>{this.props.label} <Button variant="link" onClick={this.add}>{this.props.addLabel || 'Add'}</Button></legend> : null}
				{this.props.value ? this.props.value.map(this._renderInnerComponent.bind(this)) : null}
			</fieldset>
		);
	}
}
