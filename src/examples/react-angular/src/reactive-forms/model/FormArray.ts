import { AbstractControl } from './AbstractControl';
import { FormControl } from './FormControl';
import { ValidatorFn, AsyncValidatorFn, AbstractControlOptions } from './types';
import { FormGroup } from './FormGroup';

/**
 * Tracks the value and validity state of an array of `FormControl`,
 * `FormGroup` or `FormArray` instances.
 *
 * A `FormArray` aggregates the values of each child `FormControl` into an array.
 * It calculates its status by reducing the status values of its children. For example, if one of
 * the controls in a `FormArray` is invalid, the entire array becomes invalid.
 *
 * `FormArray` is one of the three fundamental building blocks used to define forms in Angular,
 * along with `FormControl` and `FormGroup`.
 *
 * @usageNotes
 *
 * ### Create an array of form controls
 *
 * ```
 * const arr = new FormArray([
 *   new FormControl('Nancy', Validators.minLength(2)),
 *   new FormControl('Drew'),
 * ]);
 *
 * console.log(arr.value);   // ['Nancy', 'Drew']
 * console.log(arr.status);  // 'VALID'
 * ```
 *
 * ### Create a form array with array-level validators
 *
 * You include array-level validators and async validators. These come in handy
 * when you want to perform validation that considers the value of more than one child
 * control.
 *
 * The two types of validators are passed in separately as the second and third arg
 * respectively, or together as part of an options object.
 *
 * ```
 * const arr = new FormArray([
 *   new FormControl('Nancy'),
 *   new FormControl('Drew')
 * ], {validators: myValidator, asyncValidators: myAsyncValidator});
 * ```
 *
	* ### Set the updateOn property for all controls in a form array
 *
 * The options object is used to set a default value for each child
 * control's `updateOn` property. If you set `updateOn` to `'blur'` at the
 * array level, all child controls default to 'blur', unless the child
 * has explicitly specified a different `updateOn` value.
 *
 * ```ts
 * const arr = new FormArray([
 *    new FormControl()
 * ], {updateOn: 'blur'});
 * ```
 *
 * ### Adding or removing controls from a form array
 *
 * To change the controls in the array, use the `push`, `insert`, `removeAt` or `clear` methods
 * in `FormArray` itself. These methods ensure the controls are properly tracked in the
 * form's hierarchy. Do not modify the array of `AbstractControl`s used to instantiate
 * the `FormArray` directly, as that result in strange and unexpected behavior such
 * as broken change detection.
 *
 * @publicApi
 */
export class FormArray extends AbstractControl<FormArray|FormGroup> {
	/**
	* Creates a new `FormArray` instance.
	*
	* @param controls An array of child controls. Each child control is given an index
	* where it is registered.
	*
	* @param validatorOrOpts A synchronous validator function, or an array of
	* such functions, or an `AbstractControlOptions` object that contains validation functions
	* and a validation trigger.
	*
	* @param asyncValidator A single async validator or array of async validator functions
	*
	*/
	constructor(
			public controls: AbstractControl[],
			validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
			asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null) {
		super(validatorOrOpts, asyncValidator);
		this._initObservables();
		this._setUpdateStrategy(validatorOrOpts);
		this._setUpControls();
		this.updateValueAndValidity({onlySelf: true, emitEvent: false});
	}

	/**
	 * Get the `AbstractControl` at the given `index` in the array.
	 *
	 * @param index Index in the array to retrieve the control
	 */
	at(index: number): AbstractControl { return this.controls[index]; }

	/**
	 * Insert a new `AbstractControl` at the end of the array.
	 *
	 * @param control Form control to be inserted
	 */
	push(control: AbstractControl): void {
		this.controls.push(control);
		this._registerControl(control);
		this.updateValueAndValidity();
		this._onCollectionChange();
	}

	/**
	 * Insert a new `AbstractControl` at the given `index` in the array.
	 *
	 * @param index Index in the array to insert the control
	 * @param control Form control to be inserted
	 */
	insert(index: number, control: AbstractControl): void {
		this.controls.splice(index, 0, control);

		this._registerControl(control);
		this.updateValueAndValidity();
	}

	/**
	 * Remove the control at the given `index` in the array.
	 *
	 * @param index Index in the array to remove the control
	 */
	removeAt(index: number): void {
		if (this.controls[index]) this.controls[index]._registerOnCollectionChange(() => {});
		this.controls.splice(index, 1);
		this.updateValueAndValidity();
	}

	/**
	 * Replace an existing control.
	 *
	 * @param index Index in the array to replace the control
	 * @param control The `AbstractControl` control to replace the existing control
	 */
	setControl(index: number, control: AbstractControl): void {
		if (this.controls[index]) this.controls[index]._registerOnCollectionChange(() => {});
		this.controls.splice(index, 1);

		if (control) {
			this.controls.splice(index, 0, control);
			this._registerControl(control);
		}

		this.updateValueAndValidity();
		this._onCollectionChange();
	}

	/**
	 * Length of the control array.
	 */
	get length(): number { return this.controls.length; }

	/**
	 * Sets the value of the `FormArray`. It accepts an array that matches
	 * the structure of the control.
	 *
	 * This method performs strict checks, and throws an error if you try
	 * to set the value of a control that doesn't exist or if you exclude the
	 * value of a control.
	 *
	 * @usageNotes
	 * ### Set the values for the controls in the form array
	 *
	 * ```
	 * const arr = new FormArray([
	 *   new FormControl(),
	 *   new FormControl()
	 * ]);
	 * console.log(arr.value);   // [null, null]
	 *
	 * arr.setValue(['Nancy', 'Drew']);
	 * console.log(arr.value);   // ['Nancy', 'Drew']
	 * ```
	 *
	 * @param value Array of values for the controls
	 * @param options Configure options that determine how the control propagates changes and
	 * emits events after the value changes
	 *
	 * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
	 * is false.
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control value is updated.
	 * When false, no events are emitted.
	 * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	 * updateValueAndValidity} method.
	 */
	setValue(value: any[], options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		this._checkAllValuesPresent(value);
		value.forEach((newValue: any, index: number) => {
			this._throwIfControlMissing(index);
			this.at(index).setValue(newValue, {onlySelf: true, emitEvent: options.emitEvent});
		});
		this.updateValueAndValidity(options);
	}

	/**
	 * Patches the value of the `FormArray`. It accepts an array that matches the
	 * structure of the control, and does its best to match the values to the correct
	 * controls in the group.
	 *
	 * It accepts both super-sets and sub-sets of the array without throwing an error.
	 *
	 * @usageNotes
	 * ### Patch the values for controls in a form array
	 *
	 * ```
	 * const arr = new FormArray([
	 *    new FormControl(),
	 *    new FormControl()
	 * ]);
	 * console.log(arr.value);   // [null, null]
	 *
	 * arr.patchValue(['Nancy']);
	 * console.log(arr.value);   // ['Nancy', null]
	 * ```
	 *
	 * @param value Array of latest values for the controls
	 * @param options Configure options that determine how the control propagates changes and
	 * emits events after the value changes
	 *
	 * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
	 * is false.
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control value is updated.
	 * When false, no events are emitted.
	 * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	 * updateValueAndValidity} method.
	 */
	patchValue(value: any[], options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		value.forEach((newValue: any, index: number) => {
			if (this.at(index)) {
				this.at(index).patchValue(newValue, {onlySelf: true, emitEvent: options.emitEvent});
			}
		});
		this.updateValueAndValidity(options);
	}

	/**
	 * Resets the `FormArray` and all descendants are marked `pristine` and `untouched`, and the
	 * value of all descendants to null or null maps.
	 *
	 * You reset to a specific form state by passing in an array of states
	 * that matches the structure of the control. The state is a standalone value
	 * or a form state object with both a value and a disabled status.
	 *
	 * @usageNotes
	 * ### Reset the values in a form array
	 *
	 * ```ts
	 * const arr = new FormArray([
	 *    new FormControl(),
	 *    new FormControl()
	 * ]);
	 * arr.reset(['name', 'last name']);
	 *
	 * console.log(this.arr.value);  // ['name', 'last name']
	 * ```
	 *
	 * ### Reset the values in a form array and the disabled status for the first control
	 *
	 * ```
	 * this.arr.reset([
	 *   {value: 'name', disabled: true},
	 *   'last'
	 * ]);
	 *
	 * console.log(this.arr.value);  // ['name', 'last name']
	 * console.log(this.arr.get(0).status);  // 'DISABLED'
	 * ```
	 *
	 * @param value Array of values for the controls
	 * @param options Configure options that determine how the control propagates changes and
	 * emits events after the value changes
	 *
	 * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
	 * is false.
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control is reset.
	 * When false, no events are emitted.
	 * The configuration options are passed to the {@link AbstractControl#updateValueAndValidity
	 * updateValueAndValidity} method.
	 */
	reset(value: any = [], options: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		this._forEachChild((control: AbstractControl, index: number) => {
			control.reset(value[index], {onlySelf: true, emitEvent: options.emitEvent});
		});
		this._updatePristine(options);
		this._updateTouched(options);
		this.updateValueAndValidity(options);
	}

	/**
	 * The aggregate value of the array, including any disabled controls.
	 *
	 * Reports all values regardless of disabled status.
	 * For enabled controls only, the `value` property is the best way to get the value of the array.
	 */
	getRawValue(): any[] {
		return this.controls.map((control: AbstractControl) => {
			return control instanceof FormControl ? control.value : (<any>control).getRawValue();
		});
	}

	/**
	 * Remove all controls in the `FormArray`.
	 *
	 * @usageNotes
	 * ### Remove all elements from a FormArray
	 *
	 * ```ts
	 * const arr = new FormArray([
	 *    new FormControl(),
	 *    new FormControl()
	 * ]);
	 * console.log(arr.length);  // 2
	 *
	 * arr.clear();
	 * console.log(arr.length);  // 0
	 * ```
	 *
	 * It's a simpler and more efficient alternative to removing all elements one by one:
	 *
	 * ```ts
	 * const arr = new FormArray([
	 *    new FormControl(),
	 *    new FormControl()
	 * ]);
	 *
	 * while (arr.length) {
	 *    arr.removeAt(0);
	 * }
	 * ```
	 */
	clear(): void {
		if (this.controls.length < 1) return;
		this._forEachChild((control: AbstractControl) => control._registerOnCollectionChange(() => {}));
		this.controls.splice(0);
		this.updateValueAndValidity();
	}

	protected getChild(arg: string|number): AbstractControl|null {
		return this.at(<number>arg) || null;
	}

	/** @internal */
	_syncPendingControls(): boolean {
		let subtreeUpdated = this.controls.reduce((updated: boolean, child: AbstractControl) => {
			return child._syncPendingControls() ? true : updated;
		}, false);
		if (subtreeUpdated) this.updateValueAndValidity({onlySelf: true});
		return subtreeUpdated;
	}

	/** @internal */
	_throwIfControlMissing(index: number): void {
		if (!this.controls.length) {
			throw new Error(`
				There are no form controls registered with this array yet.  If you're using ngModel,
				you may want to check next tick (e.g. use setTimeout).
			`);
		}
		if (!this.at(index)) {
			throw new Error(`Cannot find form control at index ${index}`);
		}
	}

	/** @internal */
	_forEachChild(cb: Function): void {
		this.controls.forEach((control: AbstractControl, index: number) => { cb(control, index); });
	}

	/** @internal */
	_updateValue(): void {
		(this as{value: any}).value =
				this.controls.filter((control) => control.enabled || this.disabled)
						.map((control) => control.value);
	}

	/** @internal */
	_anyControls(condition: Function): boolean {
		return this.controls.some((control: AbstractControl) => control.enabled && condition(control));
	}

	/** @internal */
	_setUpControls(): void {
		this._forEachChild((control: AbstractControl) => this._registerControl(control));
	}

	/** @internal */
	_checkAllValuesPresent(value: any): void {
		this._forEachChild((control: AbstractControl, i: number) => {
			if (value[i] === undefined) {
				throw new Error(`Must supply a value for form control at index: ${i}.`);
			}
		});
	}

	/** @internal */
	_allControlsDisabled(): boolean {
		for (const control of this.controls) {
			if (control.enabled) return false;
		}
		return this.controls.length > 0 || this.disabled;
	}

	private _registerControl(control: AbstractControl) {
		control.setParent(this);
		control._registerOnCollectionChange(this._onCollectionChange);
	}
}
