import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import { makeMessages, simpleShouldComponentUpdate, EditorComponentProps } from 'controls/utils';

export interface InputTextProps extends EditorComponentProps<string> {
	label: string;
}

interface InputTextState {
	value: string;
}

export default class InputText extends Component<InputTextProps, InputTextState> {

	private _handlers: { [key:string]: any } = {
		handleChange: null
	};

	constructor(props: InputTextProps) {
		super(props);
		this.state = this._makeState(props);
		this._handlers.handleChange = this.handleChange.bind(this);
	}

	componentWillReceiveProps(nextProps: InputTextProps) {
		this.setState(this._makeState(nextProps));
	}

	private _makeState(props: InputTextProps): InputTextState {
		return {
			value: props.value || ''
		};
	}

	handleChange(event: any) {
		this.props.onChange && this.props.onChange(event.target.value);
	}

	shouldComponentUpdate(nextProps: InputTextProps, nextState: InputTextState) {
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
