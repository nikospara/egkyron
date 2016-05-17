import React, { Component } from 'react';
import Vaccination from 'model/Vaccination';
import InputText from 'controls/InputText';
import { attachInput, simpleShouldComponentUpdate } from 'controls/utils';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class InputVaccination extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value || new Vaccination()
		};
	}

	handleChange(field, value) {
		var newValue = new Vaccination(this.state.value);
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
			<Row componentClass="fieldset">
				{this.props.label ? <legend>{this.props.label}</legend> : null}
				<Col sm={7}>
					<InputText  label="Type" {...attachInput(this, 'type')} />
				</Col>
				<Col sm={5}>
					<InputText  label="Date" {...attachInput(this, 'date')} />
				</Col>
			</Row>
		);
	}
}

InputVaccination.propTypes = {
	value: React.PropTypes.instanceOf(Vaccination),
	onChange: React.PropTypes.func,
	label: React.PropTypes.string,
	validity: React.PropTypes.object
};
