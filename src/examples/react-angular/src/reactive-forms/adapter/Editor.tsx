import { Component, ReactNode } from 'react';
import { AbstractControl } from 'reactive-forms/model/AbstractControl';
import ValidationResultNode from 'egkyron/ValidationResultNode';
import { EditorComponentProps } from 'controls/utils';

export interface EditorProps<V> {
	control: AbstractControl;
	children: (a: EditorComponentProps<V>) => ReactNode;
}

interface EditorState<V> {
	value: V | null;
	onChange: (value: V | null) => void;
	validity?: ValidationResultNode<any>;
}

export class Editor<V> extends Component<EditorProps<V>,EditorState<V>> {
	constructor(props: EditorProps<V>) {
		super(props);
		this.onChange = this.onChange.bind(this);
		this.state = this._makeState(props);
	}

	private _makeState(props: EditorProps<V>): EditorState<V> {
		return {
			value: props.control.value,
			onChange: this.onChange
		}
	}

	private onChange(value: V | null) {
		this.props.control && this.props.control.setValue(value);
		this.setState({
			value: this.props.control.value
		});
	}

	render() {
		return this.props.children(this.state);
	}
}
