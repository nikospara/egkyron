import { AbstractControl } from './AbstractControl';
import { FormControl } from './FormControl';
import { ValidatorFn, AsyncValidatorFn, AbstractControlOptions } from './types';

/**
 * Tracks the value and validity state of a group of `FormControl` instances.
 *
 * A `FormGroup` aggregates the values of each child `FormControl` into one object,
 * with each control name as the key.  It calculates its status by reducing the status values
 * of its children. For example, if one of the controls in a group is invalid, the entire
 * group becomes invalid.
 *
 * `FormGroup` is one of the three fundamental building blocks used to define forms in Angular,
 * along with `FormControl` and `FormArray`.
 *
 * When instantiating a `FormGroup`, pass in a collection of child controls as the first
 * argument. The key for each child registers the name for the control.
 *
 * @usageNotes
 *
 * ### Create a form group with 2 controls
 *
 * ```
 * const form = new FormGroup({
 *   first: new FormControl('Nancy', Validators.minLength(2)),
 *   last: new FormControl('Drew'),
 * });
 *
 * console.log(form.value);   // {first: 'Nancy', last; 'Drew'}
 * console.log(form.status);  // 'VALID'
 * ```
 *
 * ### Create a form group with a group-level validator
 *
 * You include group-level validators as the second arg, or group-level async
 * validators as the third arg. These come in handy when you want to perform validation
 * that considers the value of more than one child control.
 *
 * ```
 * const form = new FormGroup({
 *   password: new FormControl('', Validators.minLength(2)),
 *   passwordConfirm: new FormControl('', Validators.minLength(2)),
 * }, passwordMatchValidator);
 *
 *
 * function passwordMatchValidator(g: FormGroup) {
 *    return g.get('password').value === g.get('passwordConfirm').value
 *       ? null : {'mismatch': true};
 * }
 * ```
 *
 * Like `FormControl` instances, you choose to pass in
 * validators and async validators as part of an options object.
 *
 * ```
 * const form = new FormGroup({
 *   password: new FormControl('')
 *   passwordConfirm: new FormControl('')
 * }, { validators: passwordMatchValidator, asyncValidators: otherValidator });
 * ```
 *
 * ### Set the updateOn property for all controls in a form group
 *
 * The options object is used to set a default value for each child
 * control's `updateOn` property. If you set `updateOn` to `'blur'` at the
 * group level, all child controls default to 'blur', unless the child
 * has explicitly specified a different `updateOn` value.
 *
 * ```ts
 * const c = new FormGroup({
 *   one: new FormControl()
 * }, { updateOn: 'blur' });
 * ```
 *
 * @publicApi
 */
export class FormGroup extends AbstractControl {
	/**
	* Creates a new `FormGroup` instance.
	*
	* @param controls A collection of child controls. The key for each child is the name
	* under which it is registered.
	*
	* @param validatorOrOpts A synchronous validator function, or an array of
	* such functions, or an `AbstractControlOptions` object that contains validation functions
	* and a validation trigger.
	*
	* @param asyncValidator A single async validator or array of async validator functions
	*
	*/
	constructor(
			public controls: {[key: string]: AbstractControl},
			validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
			asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
		super(validatorOrOpts, asyncValidator);
		this._initObservables();
		this._setUpdateStrategy(validatorOrOpts);
		this._setUpControls();
		this.updateValueAndValidity({onlySelf: true, emitEvent: false});
	}

	/**
	 * Registers a control with the group's list of controls.
	 *
	 * This method does not update the value or validity of the control.
	 * Use {@link FormGroup#addControl addControl} instead.
	 *
	 * @param name The control name to register in the collection
	 * @param control Provides the control for the given name
	 */
	registerControl(name: string, control: AbstractControl): AbstractControl {
		if (this.controls[name]) return this.controls[name];
		this.controls[name] = control;
		control.setParent(this);
		control._registerOnCollectionChange(this._onCollectionChange);
		return control;
	}

	/**
	 * Add a control to this group.
	 *
	 * This method also updates the value and validity of the control.
	 *
	 * @param name The control name to add to the collection
	 * @param control Provides the control for the given name
	 */
	addControl(name: string, control: AbstractControl): void {
		this.registerControl(name, control);
		this.updateValueAndValidity();
		this._onCollectionChange();
	}

	/**
	 * Remove a control from this group.
	 *
	 * @param name The control name to remove from the collection
	 */
	removeControl(name: string): void {
		if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
		delete (this.controls[name]);
		this.updateValueAndValidity();
		this._onCollectionChange();
	}

	/**
	 * Replace an existing control.
	 *
	 * @param name The control name to replace in the collection
	 * @param control Provides the control for the given name
	 */
	setControl(name: string, control: AbstractControl): void {
		if (this.controls[name]) this.controls[name]._registerOnCollectionChange(() => {});
		delete (this.controls[name]);
		if (control) this.registerControl(name, control);
		this.updateValueAndValidity();
		this._onCollectionChange();
	}

	/**
	 * Check whether there is an enabled control with the given name in the group.
	 *
	 * Reports false for disabled controls. If you'd like to check for existence in the group
	 * only, use {@link AbstractControl#get get} instead.
	 *
	 * @param name The control name to check for existence in the collection
	 *
	 * @returns false for disabled controls, true otherwise.
	 */
	contains(controlName: string): boolean {
		return this.controls.hasOwnProperty(controlName) && this.controls[controlName].enabled;
	}

	/**
	 * Sets the value of the `FormGroup`. It accepts an object that matches
	 * the structure of the group, with control names as keys.
	 *
	 * @usageNotes
	 * ### Set the complete value for the form group
	 *
	 * ```
	 * const form = new FormGroup({
	 *   first: new FormControl(),
	 *   last: new FormControl()
	 * });
	 *
	 * console.log(form.value);   // {first: null, last: null}
	 *
	 * form.setValue({first: 'Nancy', last: 'Drew'});
	 * console.log(form.value);   // {first: 'Nancy', last: 'Drew'}
	 * ```
	 *
	 * @throws When strict checks fail, such as setting the value of a control
	 * that doesn't exist or if you excluding the value of a control.
	 *
	 * @param value The new value for the control that matches the structure of the group.
	 * @param options Configuration options that determine how the control propagates changes
	 * and emits events after the value changes.
	 * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	 * updateValueAndValidity} method.
	 *
	 * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
	 * false.
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control value is updated.
	 * When false, no events are emitted.
	 */
	setValue(value: {[key: string]: any}, options: {onlySelf?: boolean, emitEvent?: boolean} = {}):
			void {
		this._checkAllValuesPresent(value);
		Object.keys(value).forEach(name => {
			this._throwIfControlMissing(name);
			this.controls[name].setValue(value[name], {onlySelf: true, emitEvent: options.emitEvent});
		});
		this.updateValueAndValidity(options);
	}

	/**
	 * Patches the value of the `FormGroup`. It accepts an object with control
	 * names as keys, and does its best to match the values to the correct controls
	 * in the group.
	 *
	 * It accepts both super-sets and sub-sets of the group without throwing an error.
	 *
	 * @usageNotes
	 * ### Patch the value for a form group
	 *
	 * ```
	 * const form = new FormGroup({
	 *    first: new FormControl(),
	 *    last: new FormControl()
	 * });
	 * console.log(form.value);   // {first: null, last: null}
	 *
	 * form.patchValue({first: 'Nancy'});
	 * console.log(form.value);   // {first: 'Nancy', last: null}
	 * ```
	 *
	 * @param value The object that matches the structure of the group.
	 * @param options Configuration options that determine how the control propagates changes and
	 * emits events after the value is patched.
	 * * `onlySelf`: When true, each change only affects this control and not its parent. Default is
	 * true.
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control value is updated.
	 * When false, no events are emitted.
	 * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	 * updateValueAndValidity} method.
	 */
	patchValue(value: {[key: string]: any}, options: {onlySelf?: boolean, emitEvent?: boolean} = {}):
			void {
		Object.keys(value).forEach(name => {
			if (this.controls[name]) {
				this.controls[name].patchValue(value[name], {onlySelf: true, emitEvent: options.emitEvent});
			}
		});
		this.updateValueAndValidity(options);
	}

	/**
	 * Resets the `FormGroup`, marks all descendants are marked `pristine` and `untouched`, and
	 * the value of all descendants to null.
	 *
	 * You reset to a specific form state by passing in a map of states
	 * that matches the structure of your form, with control names as keys. The state
	 * is a standalone value or a form state object with both a value and a disabled
	 * status.
	 *
	 * @param formState Resets the control with an initial value,
	 * or an object that defines the initial value and disabled state.
	 *
	 * @param options Configuration options that determine how the control propagates changes
	 * and emits events when the group is reset.
	 * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
	 * false.
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control is reset.
	 * When false, no events are emitted.
	 * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	 * updateValueAndValidity} method.
	 *
	 * @usageNotes
	 *
	 * ### Reset the form group values
	 *
	 * ```ts
	 * const form = new FormGroup({
	 *   first: new FormControl('first name'),
	 *   last: new FormControl('last name')
	 * });
	 *
	 * console.log(form.value);  // {first: 'first name', last: 'last name'}
	 *
	 * form.reset({ first: 'name', last: 'last name' });
	 *
	 * console.log(form.value);  // {first: 'name', last: 'last name'}
	 * ```
	 *
	 * ### Reset the form group values and disabled status
	 *
	 * ```
	 * const form = new FormGroup({
	 *   first: new FormControl('first name'),
	 *   last: new FormControl('last name')
	 * });
	 *
	 * form.reset({
	 *   first: {value: 'name', disabled: true},
	 *   last: 'last'
	 * });
	 *
	 * console.log(this.form.value);  // {first: 'name', last: 'last name'}
	 * console.log(this.form.get('first').status);  // 'DISABLED'
	 * ```
	 */
	reset(value: any = {}, options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		this._forEachChild((control: AbstractControl, name: string) => {
			control.reset(value[name], {onlySelf: true, emitEvent: options.emitEvent});
		});
		this._updatePristine(options);
		this._updateTouched(options);
		this.updateValueAndValidity(options);
	}

	/**
	 * The aggregate value of the `FormGroup`, including any disabled controls.
	 *
	 * Retrieves all values regardless of disabled status.
	 * The `value` property is the best way to get the value of the group, because
	 * it excludes disabled controls in the `FormGroup`.
	 */
	getRawValue(): any {
		return this._reduceChildren(
				{}, (acc: {[k: string]: AbstractControl}, control: AbstractControl, name: string) => {
					acc[name] = control instanceof FormControl ? control.value : (<any>control).getRawValue();
					return acc;
				});
	}

	/** @internal */
	_syncPendingControls(): boolean {
		let subtreeUpdated = this._reduceChildren(false, (updated: boolean, child: AbstractControl) => {
			return child._syncPendingControls() ? true : updated;
		});
		if (subtreeUpdated) this.updateValueAndValidity({onlySelf: true});
		return subtreeUpdated;
	}

	/** @internal */
	_throwIfControlMissing(name: string): void {
		if (!Object.keys(this.controls).length) {
			throw new Error(`
				There are no form controls registered with this group yet.  If you're using ngModel,
				you may want to check next tick (e.g. use setTimeout).
			`);
		}
		if (!this.controls[name]) {
			throw new Error(`Cannot find form control with name: ${name}.`);
		}
	}

	/** @internal */
	_forEachChild(cb: (v: any, k: string) => void): void {
		Object.keys(this.controls).forEach(k => cb(this.controls[k], k));
	}

	/** @internal */
	_setUpControls(): void {
		this._forEachChild((control: AbstractControl) => {
			control.setParent(this);
			control._registerOnCollectionChange(this._onCollectionChange);
		});
	}

	/** @internal */
	_updateValue(): void { (this as{value: any}).value = this._reduceValue(); }

	/** @internal */
	_anyControls(condition: Function): boolean {
		let res = false;
		this._forEachChild((control: AbstractControl, name: string) => {
			res = res || (this.contains(name) && condition(control));
		});
		return res;
	}

	/** @internal */
	_reduceValue() {
		return this._reduceChildren(
				{}, (acc: {[k: string]: AbstractControl}, control: AbstractControl, name: string) => {
					if (control.enabled || this.disabled) {
						acc[name] = control.value;
					}
					return acc;
				});
	}

	/** @internal */
	_reduceChildren(initValue: any, fn: Function) {
		let res = initValue;
		this._forEachChild(
				(control: AbstractControl, name: string) => { res = fn(res, control, name); });
		return res;
	}

	/** @internal */
	_allControlsDisabled(): boolean {
		for (const controlName of Object.keys(this.controls)) {
			if (this.controls[controlName].enabled) {
				return false;
			}
		}
		return Object.keys(this.controls).length > 0 || this.disabled;
	}

	/** @internal */
	_checkAllValuesPresent(value: any): void {
		this._forEachChild((control: AbstractControl, name: string) => {
			if (value[name] === undefined) {
				throw new Error(`Must supply a value for form control with name: '${name}'.`);
			}
		});
	}
}
