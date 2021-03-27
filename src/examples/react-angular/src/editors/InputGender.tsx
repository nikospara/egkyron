import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import { makeMessages, simpleShouldComponentUpdate, EditorComponentProps } from 'controls/utils';

export interface InputGenderProps extends EditorComponentProps<string> {
	label: string;
	options: Array<{ id: string, label: string }>;
}

interface InputGenderState {
	value: string;
}

export default class InputGender extends Component<InputGenderProps,InputGenderState> {

	constructor(props: InputGenderProps) {
		super(props);
		this.state = this._makeState(props);
		this.handleChange = this.handleChange.bind(this);
	}

	private _makeState(props: InputGenderProps): InputGenderState {
		return {
			value: props.value || ''
		};
	}

	handleChange(event: any) {
		this.setState({
			value: event.target.value || ''
		});
		this.props.onChange && this.props.onChange(event.target.value || null);
	}

	private _makeOptions() {
		return [
			<option key=""></option>,
			...this.props.options.map(o => <option value={o.id} key={o.id}>{o.label}</option>)
		];
	}

	shouldComponentUpdate(nextProps: InputGenderProps, nextState: InputGenderState) {
		return simpleShouldComponentUpdate.call(this, nextProps, nextState);
	}

	render() {
		var messages = makeMessages(this);
		var isInvalid = this.props.validity != null && this.props.validity._thisValid === false;

		return (
			<Form.Group>
				<Form.Label>{this.props.label}</Form.Label>
				<Form.Control as="select" value={this.state.value} onChange={this.handleChange} isInvalid={isInvalid}>
					{this._makeOptions()}
				</Form.Control>
				<Form.Control.Feedback type="invalid">
					{messages}
				</Form.Control.Feedback>
			</Form.Group>
		);
	}
}
