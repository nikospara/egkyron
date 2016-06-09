React example
=============

This example demonstrates the usage of Egkyron with React.

### Running

This example is using Webpack.
Install everything with `npm install` and run `npm start`.
It has no server (other than the dev server of Webpack).
If you are interested in using Egkyron with Node, please see the Angular example.

Open `http://localhost:8180/index.html` in the browser.

The fields with constraints are the name of the pet owner (under "Personal data") (length 2 to 20, no spaces) and the name of the pet (length 3 to 20 for the `ConstructorIntrospector`, and 3 to 10 for the `ExternalConstraintsIntrospector`, no spaces).

The concept of editors
----------------------

The inspiration for this is GWT's [editor framework](http://www.gwtproject.org/doc/latest/DevGuideUiEditors.html).

Users interact with the data of applications through forms.
We are used to seeing form `<input>` elements for editing simple primitive values (strings, numbers, booleans - with the `type="checkbox"`) and dates.
But what about the complex data in a model, e.g. the address of a person?
Two common solutions (in pseudocode) are:

- Edit the nested properties of the nested object directly, e.g. `<input value={person.address.street} />`
- Use a component that takes the address object and then edits its properties, without touching the object itself: `<InputAddress address={person.address} />`, implemented like: `<div><input value={this.props.address.street} /></div>`

This example (and the previous Angular 1.x example) uses a technique similar to the second case, but the address object itself changes with every change of its properties.
This approach is compatible with the current trend of using immutable objects for the model of the application.
The address editor is used in this example as (see `InputOwner.js` and `InputAddress.js` under `app/app/editors`):

```jsx
<InputAddress label="Address" {...attachInput(this, 'address')} />
```

The helper `attachInput()` (see `app/controls/utils.js`) attaches the value and the validation state of the `address` property of the value of the current component to the given `<InputAddress>` editor. And it is simply implemented as:

```jsx
export function attachInput(component, fieldName) {
	return {
		value: component.state.value ? component.state.value[fieldName] : null,
		onChange: component.handleChange.bind(component, fieldName),
		validity: component.props.validity && component.props.validity._children ? component.props.validity._children[fieldName] : {}
	};
}
```

There editor-to-model relationship is potentially many editors for each model.
Whenever the need to edit a model or a subset of its properties arises, write an editor.

Disecting an editor
-------------------

Technically an editor (see everything under `app/editors` and `app/controls/InputText.js`) is a React component having at least 3 properties:

- `value` is the initial value of the editor
- `onChange` is a callback to notify the parent of changes of this property
- `validity` is the validation state

In this example we also add a fourth property: the label of the editor.

Internally every editor component has an `handleChange(field, value)`, for editors of complex objects, or `handleChange(event)`, for editors of primitives (see `InputText.js`) method.
This is passed to its child editors or the plain HTML `<input>` for editors of primitive values.

The `handleChange(field, value)` for editors of complex objects has to create a new model object of the appropriate type, set the field that changed and call the `onChange` callback:

```jsx
handleChange(field, value) {
	var newValue = new Owner(this.state.value);
	newValue[field] = value;
	this.setState({
		value: newValue
	});
	this.props.onChange && this.props.onChange(newValue);
}
```

Whenever an editable value changes, all its parents are notified and new objects are created (instead of mutating the existing ones).
When the change reaches the topmost component - the one responsible for the entire form, e.g. the `OwnerView` in this example - the model is validated.
Relevant code from the `OwnerView`:

```jsx
export default class OwnerView extends Component {
	constructor(props) {
		super(props);
		this.state = this._makeState(props);
	}

	_makeState(props) {
		var validator, value;
		// create an Egkyron Validator
		validator = new Validator(makeValidatorRegistry(), new ConstructorIntrospector());
		value = new Owner();
		return {
			value,
			// keep the validator in our state...
			validator,
			// and calculate the initial validation state
			validity: validator.validate(value).result
		};
	}

	onModelChange(value) {
		this.setState({
			value,
			// when the model changes, update the validity state
			validity: this.state.validator.validate(value).result
		});
	}

	...
}
```

The change in validity state flushes now from top to bottom (i.e. from the `OwnerView` down to each `<input>`).
This is a potential weak point in this implementation: state is changed twice (once for the mode, bottom to top, and once for the validation, top to bottom).
This means that the view will be rendered twice for each change.
No performance issues were found for this small example.
Just in case, we implemented a very simple `shouldComponentUpdate(nextProps, nextState)` using `utils/simpleShouldComponentUpdate(nextProps, nextState)`.
If performance problems do arise, there are at least two things to try:

1. Make `shouldComponentUpdate()` more sophisticated.
2. Debounce (or throttle) the change events to limit rerenderings.

### Arrays are editable too

If a property holds an array of things, there is an editor for that too:
the edit operations are addition, deletion and reordering of elements.
See the `app/editors/InputArray.js`.
