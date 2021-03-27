import { AbstractControl } from './AbstractControl';
import { ValidatorFn, AsyncValidatorFn, AbstractControlOptions } from './types';

/**
 * Tracks the value and validation status of an individual form control.
 *
 * This is one of the three fundamental building blocks of Angular forms, along with
 * `FormGroup` and `FormArray`. It extends the `AbstractControl` class that
 * implements most of the base functionality for accessing the value, validation status,
 * user interactions and events.
 *
 * @see `AbstractControl`
 * @see [Reactive Forms Guide](guide/reactive-forms)
 * @see [Usage Notes](#usage-notes)
 *
 * @usageNotes
 *
 * ### Initializing Form Controls
 *
 * Instantiate a `FormControl`, with an initial value.
 *
 * ```ts
 * const control = new FormControl('some value');
 * console.log(control.value);     // 'some value'
 *```
 *
 * The following example initializes the control with a form state object. The `value`
 * and `disabled` keys are required in this case.
 *
 * ```ts
 * const control = new FormControl({ value: 'n/a', disabled: true });
 * console.log(control.value);     // 'n/a'
 * console.log(control.status);    // 'DISABLED'
 * ```
 *
 * The following example initializes the control with a sync validator.
 *
 * ```ts
 * const control = new FormControl('', Validators.required);
 * console.log(control.value);      // ''
 * console.log(control.status);     // 'INVALID'
 * ```
 *
 * The following example initializes the control using an options object.
 *
 * ```ts
 * const control = new FormControl('', {
 *    validators: Validators.required,
 *    asyncValidators: myAsyncValidator
 * });
 * ```
 *
 * ### Configure the control to update on a blur event
 *
 * Set the `updateOn` option to `'blur'` to update on the blur `event`.
 *
 * ```ts
 * const control = new FormControl('', { updateOn: 'blur' });
 * ```
 *
 * ### Configure the control to update on a submit event
 *
 * Set the `updateOn` option to `'submit'` to update on a submit `event`.
 *
 * ```ts
 * const control = new FormControl('', { updateOn: 'submit' });
 * ```
 *
 * ### Reset the control back to an initial value
 *
 * You reset to a specific form state by passing through a standalone
 * value or a form state object that contains both a value and a disabled state
 * (these are the only two properties that cannot be calculated).
 *
 * ```ts
 * const control = new FormControl('Nancy');
 *
 * console.log(control.value); // 'Nancy'
 *
 * control.reset('Drew');
 *
 * console.log(control.value); // 'Drew'
 * ```
 *
 * ### Reset the control back to an initial value and disabled
 *
 * ```
 * const control = new FormControl('Nancy');
 *
 * console.log(control.value); // 'Nancy'
 * console.log(control.status); // 'VALID'
 *
 * control.reset({ value: 'Drew', disabled: true });
 *
 * console.log(control.value); // 'Drew'
 * console.log(control.status); // 'DISABLED'
 * ```
 *
 * @publicApi
 */
export class FormControl extends AbstractControl {
	/** @internal */
	_onChange: Function[] = [];

	/** @internal */
	_pendingValue: any;

	/** @internal */
	_pendingChange: any;

	/**
	* Creates a new `FormControl` instance.
	*
	* @param formState Initializes the control with an initial value,
	* or an object that defines the initial value and disabled state.
	*
	* @param validatorOrOpts A synchronous validator function, or an array of
	* such functions, or an `AbstractControlOptions` object that contains validation functions
	* and a validation trigger.
	*
	* @param asyncValidator A single async validator or array of async validator functions
	*
	*/
	constructor(
			formState: any = null,
			validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
			asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
		super(validatorOrOpts, asyncValidator);
		this._applyFormState(formState);
		this._setUpdateStrategy(validatorOrOpts);
		this.updateValueAndValidity({onlySelf: true, emitEvent: false});
		this._initObservables();
	}

	/**
	 * Sets a new value for the form control.
	 *
	 * @param value The new value for the control.
	 * @param options Configuration options that determine how the control propagates changes
	 * and emits events when the value changes.
	 * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	 * updateValueAndValidity} method.
	 *
	 * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
	 * false.
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control value is updated.
	 * When false, no events are emitted.
	 * * `emitModelToViewChange`: When true or not supplied  (the default), each change triggers an
	 * `onChange` event to
	 * update the view.
	 * * `emitViewToModelChange`: When true or not supplied (the default), each change triggers an
	 * `ngModelChange`
	 * event to update the model.
	 *
	 */
	setValue(value: any, options: {
		onlySelf?: boolean,
		emitEvent?: boolean,
		emitModelToViewChange?: boolean,
		emitViewToModelChange?: boolean
	} = {}): void {
		(this as{value: any}).value = this._pendingValue = value;
		if (this._onChange.length && options.emitModelToViewChange !== false) {
			this._onChange.forEach(
					(changeFn) => changeFn(this.value, options.emitViewToModelChange !== false));
		}
		this.updateValueAndValidity(options);
	}

	/**
	 * Patches the value of a control.
	 *
	 * This function is functionally the same as {@link FormControl#setValue setValue} at this level.
	 * It exists for symmetry with {@link FormGroup#patchValue patchValue} on `FormGroups` and
	 * `FormArrays`, where it does behave differently.
	 *
	 * @see `setValue` for options
	 */
	patchValue(value: any, options: {
		onlySelf?: boolean,
		emitEvent?: boolean,
		emitModelToViewChange?: boolean,
		emitViewToModelChange?: boolean
	} = {}): void {
		this.setValue(value, options);
	}

	/**
	 * Resets the form control, marking it `pristine` and `untouched`, and setting
	 * the value to null.
	 *
	 * @param formState Resets the control with an initial value,
	 * or an object that defines the initial value and disabled state.
	 *
	 * @param options Configuration options that determine how the control propagates changes
	 * and emits events after the value changes.
	 *
	 * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
	 * false.
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control is reset.
	 * When false, no events are emitted.
	 *
	 */
	reset(formState: any = null, options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		this._applyFormState(formState);
		this.markAsPristine(options);
		this.markAsUntouched(options);
		this.setValue(this.value, options);
		this._pendingChange = false;
	}

	/**
	 * @internal
	 */
	_updateValue() {}

	/**
	 * @internal
	 */
	_anyControls(condition: Function): boolean { return false; }

	/**
	 * @internal
	 */
	_allControlsDisabled(): boolean { return this.disabled; }

	/**
	 * Register a listener for change events.
	 *
	 * @param fn The method that is called when the value changes
	 */
	registerOnChange(fn: Function): void { this._onChange.push(fn); }

	/**
	 * @internal
	 */
	_clearChangeFns(): void {
		this._onChange = [];
		this._onDisabledChange = [];
		this._onCollectionChange = () => {};
	}

	/**
	 * Register a listener for disabled events.
	 *
	 * @param fn The method that is called when the disabled status changes.
	 */
	registerOnDisabledChange(fn: (isDisabled: boolean) => void): void {
		this._onDisabledChange.push(fn);
	}

	/**
	 * @internal
	 */
	_forEachChild(cb: Function): void {}

	/** @internal */
	_syncPendingControls(): boolean {
		if (this.updateOn === 'submit') {
			if (this._pendingDirty) this.markAsDirty();
			if (this._pendingTouched) this.markAsTouched();
			if (this._pendingChange) {
				this.setValue(this._pendingValue, {onlySelf: true, emitModelToViewChange: false});
				return true;
			}
		}
		return false;
	}

	private _applyFormState(formState: any) {
		if (this._isBoxedValue(formState)) {
			(this as{value: any}).value = this._pendingValue = formState.value;
			formState.disabled ? this.disable({onlySelf: true, emitEvent: false}) :
													 this.enable({onlySelf: true, emitEvent: false});
		} else {
			(this as{value: any}).value = this._pendingValue = formState;
		}
	}
}
