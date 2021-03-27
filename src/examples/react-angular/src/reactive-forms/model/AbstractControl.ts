/* eslint-disable @typescript-eslint/no-angle-bracket-type-assertion */

import { Observable, Subject, from, forkJoin, isObservable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
	ValidationErrors, Validator, AsyncValidator, ValidatorFn, AsyncValidatorFn, AbstractControlOptions, FormHooks,
	VALID, INVALID, PENDING, DISABLED
} from './types';

function _executeValidators(control: AbstractControl, validators: ValidatorFn[]): any[] {
	return validators.map(v => v(control));
}

function _mergeErrors(arrayOfErrors: ValidationErrors[]): ValidationErrors|null {
	const res: {[key: string]: any} =
		arrayOfErrors.reduce((res: ValidationErrors | null, errors: ValidationErrors | null) => {
			return errors != null ? {...res !, ...errors} : res !;
		}, {});
	return Object.keys(res).length === 0 ? null : res;
}

function compose(validators: null): null;
function compose(validators: (ValidatorFn|null|undefined)[]): ValidatorFn|null;
function compose(validators: (ValidatorFn|null|undefined)[]|null): ValidatorFn|null {
	if (!validators) return null;
	const presentValidators: ValidatorFn[] = validators.filter(o => o != null) as any;
	if (presentValidators.length === 0) return null;

	return function(control: AbstractControl) {
		return _mergeErrors(_executeValidators(control, presentValidators));
	};
}

function isPromise(r: any): r is Promise<any> {
	return !!r && typeof r.then === 'function';
}

function toObservable(r: any): Observable<any> {
	const obs = isPromise(r) ? from(r) : r;
	if (!(isObservable(obs))) {
		throw new Error(`Expected validator to return Promise or Observable.`);
	}
	return obs;
}

function composeAsync(validators: (AsyncValidatorFn|null)[]): AsyncValidatorFn|null {
	if (!validators) return null;
	const presentValidators: AsyncValidatorFn[] = validators.filter(o => o != null) as any;
	if (presentValidators.length === 0) return null;

	return function(control: AbstractControl) {
		const observables = presentValidators.map(v => toObservable(v(control)))
		return forkJoin(observables).pipe(map(_mergeErrors));
	};
}

function normalizeValidator(validator: ValidatorFn | Validator): ValidatorFn {
	if ((<Validator>validator).validate) {
		return (c: AbstractControl) => (<Validator>validator).validate(c);
	} else {
		return <ValidatorFn>validator;
	}
}

function normalizeAsyncValidator(validator: AsyncValidatorFn | AsyncValidator): AsyncValidatorFn {
	if ((<AsyncValidator>validator).validate) {
		return (c: AbstractControl) => (<AsyncValidator>validator).validate(c);
	} else {
		return <AsyncValidatorFn>validator;
	}
}

function composeValidators(validators: Array<Validator|ValidatorFn>): ValidatorFn|null {
	return validators != null ? compose(validators.map(normalizeValidator)) : null;
}

function composeAsyncValidators(validators: Array<AsyncValidator|AsyncValidatorFn>): AsyncValidatorFn|null {
	return validators != null ? composeAsync(validators.map(normalizeAsyncValidator)) : null;
}

function coerceToValidator(validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): ValidatorFn|null {
	const validator =
		(isOptionsObj(validatorOrOpts) ? (validatorOrOpts as AbstractControlOptions).validators : validatorOrOpts) as ValidatorFn | ValidatorFn[] | null;
	return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}

function coerceToAsyncValidator(asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): AsyncValidatorFn|null {
	const origAsyncValidator =
		(isOptionsObj(validatorOrOpts) ? (validatorOrOpts as AbstractControlOptions).asyncValidators : asyncValidator) as AsyncValidatorFn | AsyncValidatorFn | null;

	return Array.isArray(origAsyncValidator) ? composeAsyncValidators(origAsyncValidator) : origAsyncValidator || null;
}

function isOptionsObj(validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null): boolean {
	return validatorOrOpts != null && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === 'object';
}

/**
 * This is the base class for `FormControl`, `FormGroup`, and `FormArray`.
 *
 * It provides some of the shared behavior that all controls and groups of controls have, like
 * running validators, calculating status, and resetting state. It also defines the properties
 * that are shared between all sub-classes, like `value`, `valid`, and `dirty`. It shouldn't be
 * instantiated directly.
 *
 * @see [Forms Guide](/guide/forms)
 * @see [Reactive Forms Guide](/guide/reactive-forms)
 * @see [Dynamic Forms Guide](/guide/dynamic-form)
 *
 * @publicApi
 */
export abstract class AbstractControl<ParentType extends AbstractControl<ParentType> = any> {
	/** @internal */
	_pendingDirty!: boolean;

	/** @internal */
	_pendingTouched!: boolean;

	/** @internal */
	_onCollectionChange = () => {};

	/** @internal */
	_updateOn!: FormHooks;

	private _parent!: ParentType;
	private _asyncValidationSubscription: any;

	/**
	 * The current value of the control.
	 *
	 * * For a `FormControl`, the current value.
	 * * For an enabled `FormGroup`, the values of enabled controls as an object
	 * with a key-value pair for each member of the group.
	 * * For a disabled `FormGroup`, the values of all controls as an object
	 * with a key-value pair for each member of the group.
	 * * For a `FormArray`, the values of enabled controls as an array.
	 *
	 */
	public readonly value: any;

//	/**
//	 * Initialize the AbstractControl instance.
//	 *
//	 * @param validator The function that determines the synchronous validity of this control.
//	 * @param asyncValidator The function that determines the asynchronous validity of this
//	 * control.
//	 */
//	constructor(public validator: ValidatorFn|null, public asyncValidator: AsyncValidatorFn|null) {}

	public validator: ValidatorFn|null;

	public asyncValidator: AsyncValidatorFn|null;

	constructor(
		validatorOrOpts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null,
		asyncValidator?: AsyncValidatorFn|AsyncValidatorFn[]|null
	) {
		this.validator = coerceToValidator(validatorOrOpts);
		this.asyncValidator = coerceToAsyncValidator(asyncValidator, validatorOrOpts);
	}

	/**
	 * The parent control.
	 */
	get parent(): ParentType { return this._parent; }

	/**
	 * The validation status of the control. There are four possible
	 * validation status values:
	 *
	 * * **VALID**: This control has passed all validation checks.
	 * * **INVALID**: This control has failed at least one validation check.
	 * * **PENDING**: This control is in the midst of conducting a validation check.
	 * * **DISABLED**: This control is exempt from validation checks.
	 *
	 * These status values are mutually exclusive, so a control cannot be
	 * both valid AND invalid or invalid AND disabled.
	 */
	public readonly status!: string;

	/**
	 * A control is `valid` when its `status` is `VALID`.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 * @returns True if the control has passed all of its validation tests,
	 * false otherwise.
	 */
	get valid(): boolean { return this.status === VALID; }

	/**
	 * A control is `invalid` when its `status` is `INVALID`.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 * @returns True if this control has failed one or more of its validation checks,
	 * false otherwise.
	 */
	get invalid(): boolean { return this.status === INVALID; }

	/**
	 * A control is `pending` when its `status` is `PENDING`.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 * @returns True if this control is in the process of conducting a validation check,
	 * false otherwise.
	 */
	get pending(): boolean { return this.status === PENDING; }

	/**
	 * A control is `disabled` when its `status` is `DISABLED`.
	 *
	 * Disabled controls are exempt from validation checks and
	 * are not included in the aggregate value of their ancestor
	 * controls.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 * @returns True if the control is disabled, false otherwise.
	 */
	get disabled(): boolean { return this.status === DISABLED; }

	/**
	 * A control is `enabled` as long as its `status` is not `DISABLED`.
	 *
	 * @returns True if the control has any status other than 'DISABLED',
	 * false if the status is 'DISABLED'.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 */
	get enabled(): boolean { return this.status !== DISABLED; }

	/**
	 * An object containing any errors generated by failing validation,
	 * or null if there are no errors.
	 */
	public readonly errors!: ValidationErrors | null;

	/**
	 * A control is `pristine` if the user has not yet changed
	 * the value in the UI.
	 *
	 * @returns True if the user has not yet changed the value in the UI; compare `dirty`.
	 * Programmatic changes to a control's value do not mark it dirty.
	 */
	public readonly pristine: boolean = true;

	/**
	 * A control is `dirty` if the user has changed the value
	 * in the UI.
	 *
	 * @returns True if the user has changed the value of this control in the UI; compare `pristine`.
	 * Programmatic changes to a control's value do not mark it dirty.
	 */
	get dirty(): boolean { return !this.pristine; }

	/**
	 * True if the control is marked as `touched`.
	 *
	 * A control is marked `touched` once the user has triggered
	 * a `blur` event on it.
	 */
	public readonly touched: boolean = false;

	/**
	 * True if the control has not been marked as touched
	 *
	 * A control is `untouched` if the user has not yet triggered
	 * a `blur` event on it.
	 */
	get untouched(): boolean { return !this.touched; }

	/**
	 * A multicasting observable that emits an event every time the value of the control changes, in
	 * the UI or programmatically.
	 */
	public readonly valueChanges!: Observable<any>;

	/**
	 * A multicasting observable that emits an event every time the validation `status` of the control
	 * recalculates.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 */
	public readonly statusChanges!: Observable<any>;

	/**
	 * Reports the update strategy of the `AbstractControl` (meaning
	 * the event on which the control updates itself).
	 * Possible values: `'change'` | `'blur'` | `'submit'`
	 * Default value: `'change'`
	 */
	get updateOn(): FormHooks {
		return this._updateOn ? this._updateOn : (this.parent ? this.parent.updateOn : 'change');
	}

	/**
	 * Sets the synchronous validators that are active on this control.  Calling
	 * this overwrites any existing sync validators.
	 *
	 * When you add or remove a validator at run time, you must call
	 * `updateValueAndValidity()` for the new validation to take effect.
	 *
	 */
	setValidators(newValidator: ValidatorFn|ValidatorFn[]|null): void {
		this.validator = coerceToValidator(newValidator);
	}

	/**
	 * Sets the async validators that are active on this control. Calling this
	 * overwrites any existing async validators.
	 *
	 * When you add or remove a validator at run time, you must call
	 * `updateValueAndValidity()` for the new validation to take effect.
	 *
	 */
	setAsyncValidators(newValidator: AsyncValidatorFn|AsyncValidatorFn[]|null): void {
		this.asyncValidator = coerceToAsyncValidator(newValidator);
	}

	/**
	 * Empties out the sync validator list.
	 *
	 * When you add or remove a validator at run time, you must call
	 * `updateValueAndValidity()` for the new validation to take effect.
	 *
	 */
	clearValidators(): void { this.validator = null; }

	/**
	 * Empties out the async validator list.
	 *
	 * When you add or remove a validator at run time, you must call
	 * `updateValueAndValidity()` for the new validation to take effect.
	 *
	 */
	clearAsyncValidators(): void { this.asyncValidator = null; }

	/**
	 * Marks the control as `touched`. A control is touched by focus and
	 * blur events that do not change the value.
	 *
	 * @see `markAsUntouched()`
	 * @see `markAsDirty()`
	 * @see `markAsPristine()`
	 *
	 * @param opts Configuration options that determine how the control propagates changes
	 * and emits events events after marking is applied.
	 * * `onlySelf`: When true, mark only this control. When false or not supplied,
	 * marks all direct ancestors. Default is false.
	 */
	markAsTouched(opts: {onlySelf?: boolean} = {}): void {
		(this as{touched: boolean}).touched = true;

		if (this._parent && !opts.onlySelf) {
			this._parent.markAsTouched(opts);
		}
	}

	/**
	 * Marks the control and all its descendant controls as `touched`.
	 * @see `markAsTouched()`
	 */
	markAllAsTouched(): void {
		this.markAsTouched({onlySelf: true});

		this._forEachChild((control: AbstractControl) => control.markAllAsTouched());
	}

	/**
	 * Marks the control as `untouched`.
	 *
	 * If the control has any children, also marks all children as `untouched`
	 * and recalculates the `touched` status of all parent controls.
	 *
	 * @see `markAsTouched()`
	 * @see `markAsDirty()`
	 * @see `markAsPristine()`
	 *
	 * @param opts Configuration options that determine how the control propagates changes
	 * and emits events after the marking is applied.
	 * * `onlySelf`: When true, mark only this control. When false or not supplied,
	 * marks all direct ancestors. Default is false.
	 */
	markAsUntouched(opts: {onlySelf?: boolean} = {}): void {
		(this as{touched: boolean}).touched = false;
		this._pendingTouched = false;

		this._forEachChild(
				(control: AbstractControl) => { control.markAsUntouched({onlySelf: true}); });

		if (this._parent && !opts.onlySelf) {
			this._parent._updateTouched(opts);
		}
	}

	/**
	 * Marks the control as `dirty`. A control becomes dirty when
	 * the control's value is changed through the UI; compare `markAsTouched`.
	 *
	 * @see `markAsTouched()`
	 * @see `markAsUntouched()`
	 * @see `markAsPristine()`
	 *
	 * @param opts Configuration options that determine how the control propagates changes
	 * and emits events after marking is applied.
	 * * `onlySelf`: When true, mark only this control. When false or not supplied,
	 * marks all direct ancestors. Default is false.
	 */
	markAsDirty(opts: {onlySelf?: boolean} = {}): void {
		(this as{pristine: boolean}).pristine = false;

		if (this._parent && !opts.onlySelf) {
			this._parent.markAsDirty(opts);
		}
	}

	/**
	 * Marks the control as `pristine`.
	 *
	 * If the control has any children, marks all children as `pristine`,
	 * and recalculates the `pristine` status of all parent
	 * controls.
	 *
	 * @see `markAsTouched()`
	 * @see `markAsUntouched()`
	 * @see `markAsDirty()`
	 *
	 * @param opts Configuration options that determine how the control emits events after
	 * marking is applied.
	 * * `onlySelf`: When true, mark only this control. When false or not supplied,
	 * marks all direct ancestors. Default is false..
	 */
	markAsPristine(opts: {onlySelf?: boolean} = {}): void {
		(this as{pristine: boolean}).pristine = true;
		this._pendingDirty = false;

		this._forEachChild((control: AbstractControl) => { control.markAsPristine({onlySelf: true}); });

		if (this._parent && !opts.onlySelf) {
			this._parent._updatePristine(opts);
		}
	}

	/**
	 * Marks the control as `pending`.
	 *
	 * A control is pending while the control performs async validation.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 * @param opts Configuration options that determine how the control propagates changes and
	 * emits events after marking is applied.
	 * * `onlySelf`: When true, mark only this control. When false or not supplied,
	 * marks all direct ancestors. Default is false..
	 * * `emitEvent`: When true or not supplied (the default), the `statusChanges`
	 * observable emits an event with the latest status the control is marked pending.
	 * When false, no events are emitted.
	 *
	 */
	markAsPending(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		(this as{status: string}).status = PENDING;

		if (opts.emitEvent !== false) {
			(this.statusChanges as Subject<any>).next(this.status);
		}

		if (this._parent && !opts.onlySelf) {
			this._parent.markAsPending(opts);
		}
	}

	/**
	 * Disables the control. This means the control is exempt from validation checks and
	 * excluded from the aggregate value of any parent. Its status is `DISABLED`.
	 *
	 * If the control has children, all children are also disabled.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 * @param opts Configuration options that determine how the control propagates
	 * changes and emits events after the control is disabled.
	 * * `onlySelf`: When true, mark only this control. When false or not supplied,
	 * marks all direct ancestors. Default is false..
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control is disabled.
	 * When false, no events are emitted.
	 */
	disable(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		// If parent has been marked artificially dirty we don't want to re-calculate the
		// parent's dirtiness based on the children.
		const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

		(this as{status: string}).status = DISABLED;
		(this as{errors: ValidationErrors | null}).errors = null;
		this._forEachChild(
				(control: AbstractControl) => { control.disable({...opts, onlySelf: true}); });
		this._updateValue();

		if (opts.emitEvent !== false) {
			(this.valueChanges as Subject<any>).next(this.value);
			(this.statusChanges as Subject<string>).next(this.status);
		}

		this._updateAncestors({...opts, skipPristineCheck});
		this._onDisabledChange.forEach((changeFn) => changeFn(true));
	}

	/**
	 * Enables the control. This means the control is included in validation checks and
	 * the aggregate value of its parent. Its status recalculates based on its value and
	 * its validators.
	 *
	 * By default, if the control has children, all children are enabled.
	 *
	 * @see {@link AbstractControl.status}
	 *
	 * @param opts Configure options that control how the control propagates changes and
	 * emits events when marked as untouched
	 * * `onlySelf`: When true, mark only this control. When false or not supplied,
	 * marks all direct ancestors. Default is false..
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control is enabled.
	 * When false, no events are emitted.
	 */
	enable(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		// If parent has been marked artificially dirty we don't want to re-calculate the
		// parent's dirtiness based on the children.
		const skipPristineCheck = this._parentMarkedDirty(opts.onlySelf);

		(this as{status: string}).status = VALID;
		this._forEachChild(
				(control: AbstractControl) => { control.enable({...opts, onlySelf: true}); });
		this.updateValueAndValidity({onlySelf: true, emitEvent: opts.emitEvent});

		this._updateAncestors({...opts, skipPristineCheck});
		this._onDisabledChange.forEach((changeFn) => changeFn(false));
	}

	private _updateAncestors(
			opts: {onlySelf?: boolean, emitEvent?: boolean, skipPristineCheck?: boolean}) {
		if (this._parent && !opts.onlySelf) {
			this._parent.updateValueAndValidity(opts);
			if (!opts.skipPristineCheck) {
				this._parent._updatePristine();
			}
			this._parent._updateTouched();
		}
	}

	/**
	 * @param parent Sets the parent of the control
	 */
	setParent(parent: ParentType): void { this._parent = parent; }

	/**
	 * Sets the value of the control. Abstract method (implemented in sub-classes).
	 */
	abstract setValue(value: any, options?: Object): void;

	/**
	 * Patches the value of the control. Abstract method (implemented in sub-classes).
	 */
	abstract patchValue(value: any, options?: Object): void;

	/**
	 * Resets the control. Abstract method (implemented in sub-classes).
	 */
	abstract reset(value?: any, options?: Object): void;

	/**
	 * Recalculates the value and validation status of the control.
	 *
	 * By default, it also updates the value and validity of its ancestors.
	 *
	 * @param opts Configuration options determine how the control propagates changes and emits events
	 * after updates and validity checks are applied.
	 * * `onlySelf`: When true, only update this control. When false or not supplied,
	 * update all direct ancestors. Default is false..
	 * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
	 * `valueChanges`
	 * observables emit events with the latest status and value when the control is updated.
	 * When false, no events are emitted.
	 */
	updateValueAndValidity(opts: {onlySelf?: boolean, emitEvent?: boolean} = {}): void {
		this._setInitialStatus();
		this._updateValue();

		if (this.enabled) {
			this._cancelExistingSubscription();
			(this as{errors: ValidationErrors | null}).errors = this._runValidator();
			(this as{status: string}).status = this._calculateStatus();

			if (this.status === VALID || this.status === PENDING) {
				this._runAsyncValidator(opts.emitEvent);
			}
		}

		if (opts.emitEvent !== false) {
			(this.valueChanges as Subject<any>).next(this.value);
			(this.statusChanges as Subject<string>).next(this.status);
		}

		if (this._parent && !opts.onlySelf) {
			this._parent.updateValueAndValidity(opts);
		}
	}

	/** @internal */
	_updateTreeValidity(opts: {emitEvent?: boolean} = {emitEvent: true}) {
		this._forEachChild((ctrl: AbstractControl) => ctrl._updateTreeValidity(opts));
		this.updateValueAndValidity({onlySelf: true, emitEvent: opts.emitEvent});
	}

	private _setInitialStatus() {
		(this as{status: string}).status = this._allControlsDisabled() ? DISABLED : VALID;
	}

	private _runValidator(): ValidationErrors|null {
		return this.validator ? this.validator(this) : null;
	}

	private _runAsyncValidator(emitEvent?: boolean): void {
		if (this.asyncValidator) {
			(this as{status: string}).status = PENDING;
			const obs = toObservable(this.asyncValidator(this));
			this._asyncValidationSubscription =
					obs.subscribe((errors: ValidationErrors | null) => this.setErrors(errors, {emitEvent}));
		}
	}

	private _cancelExistingSubscription(): void {
		if (this._asyncValidationSubscription) {
			this._asyncValidationSubscription.unsubscribe();
		}
	}

	/**
	 * Sets errors on a form control when running validations manually, rather than automatically.
	 *
	 * Calling `setErrors` also updates the validity of the parent control.
	 *
	 * @usageNotes
	 * ### Manually set the errors for a control
	 *
	 * ```
	 * const login = new FormControl('someLogin');
	 * login.setErrors({
	 *   notUnique: true
	 * });
	 *
	 * expect(login.valid).toEqual(false);
	 * expect(login.errors).toEqual({ notUnique: true });
	 *
	 * login.setValue('someOtherLogin');
	 *
	 * expect(login.valid).toEqual(true);
	 * ```
	 */
	setErrors(errors: ValidationErrors|null, opts: {emitEvent?: boolean} = {}): void {
		(this as{errors: ValidationErrors | null}).errors = errors;
		this._updateControlsErrors(opts.emitEvent !== false);
	}

	/**
	 * Retrieves a child control given the control's name or path.
	 *
	 * @param path A dot-delimited string or array of string/number values that define the path to the
	 * control.
	 *
	 * @usageNotes
	 * ### Retrieve a nested control
	 *
	 * For example, to get a `name` control nested within a `person` sub-group:
	 *
	 * * `this.form.get('person.name');`
	 *
	 * -OR-
	 *
	 * * `this.form.get(['person', 'name']);`
	 */
	get(path: Array<string|number>|string, delimiter = '.'): AbstractControl|null {
		if (path == null) return null;

		if (!(path instanceof Array)) {
			path = (<string>path).split(delimiter);
		}
		if (path instanceof Array && (path.length === 0)) return null;

		return (<Array<string|number>>path).reduce((v: AbstractControl|null, name) => (!!v ? v.getChild(name) : null), this);
	}

	protected abstract getChild(arg: string|number): AbstractControl|null;

	/**
	 * @description
	 * Reports error data for the control with the given path.
	 *
	 * @param errorCode The code of the error to check
	 * @param path A list of control names that designates how to move from the current control
	 * to the control that should be queried for errors.
	 *
	 * @usageNotes
	 * For example, for the following `FormGroup`:
	 *
	 * ```
	 * form = new FormGroup({
	 *   address: new FormGroup({ street: new FormControl() })
	 * });
	 * ```
	 *
	 * The path to the 'street' control from the root form would be 'address' -> 'street'.
	 *
	 * It can be provided to this method in one of two formats:
	 *
	 * 1. An array of string control names, e.g. `['address', 'street']`
	 * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
	 *
	 * @returns error data for that particular error. If the control or error is not present,
	 * null is returned.
	 */
	getError(errorCode: string, path?: Array<string|number>|string): any {
		const control = path ? this.get(path) : this;
		return control && control.errors ? control.errors[errorCode] : null;
	}

	/**
	 * @description
	 * Reports whether the control with the given path has the error specified.
	 *
	 * @param errorCode The code of the error to check
	 * @param path A list of control names that designates how to move from the current control
	 * to the control that should be queried for errors.
	 *
	 * @usageNotes
	 * For example, for the following `FormGroup`:
	 *
	 * ```
	 * form = new FormGroup({
	 *   address: new FormGroup({ street: new FormControl() })
	 * });
	 * ```
	 *
	 * The path to the 'street' control from the root form would be 'address' -> 'street'.
	 *
	 * It can be provided to this method in one of two formats:
	 *
	 * 1. An array of string control names, e.g. `['address', 'street']`
	 * 1. A period-delimited list of control names in one string, e.g. `'address.street'`
	 *
	 * If no path is given, this method checks for the error on the current control.
	 *
	 * @returns whether the given error is present in the control at the given path.
	 *
	 * If the control is not present, false is returned.
	 */
	hasError(errorCode: string, path?: Array<string|number>|string): boolean {
		return !!this.getError(errorCode, path);
	}

	/**
	 * Retrieves the top-level ancestor of this control.
	 */
	get root(): AbstractControl {
		let x: AbstractControl = this;

		while (x._parent) {
			x = x._parent;
		}

		return x;
	}

	/** @internal */
	_updateControlsErrors(emitEvent: boolean): void {
		(this as{status: string}).status = this._calculateStatus();

		if (emitEvent) {
			(this.statusChanges as Subject<string>).next(this.status);
		}

		if (this._parent) {
			this._parent._updateControlsErrors(emitEvent);
		}
	}

	/** @internal */
	_initObservables() {
		(this as{valueChanges: Observable<any>}).valueChanges = new Subject();
		(this as{statusChanges: Observable<any>}).statusChanges = new Subject();
	}


	private _calculateStatus(): string {
		if (this._allControlsDisabled()) return DISABLED;
		if (this.errors) return INVALID;
		if (this._anyControlsHaveStatus(PENDING)) return PENDING;
		if (this._anyControlsHaveStatus(INVALID)) return INVALID;
		return VALID;
	}

	/** @internal */
	abstract _updateValue(): void;

	/** @internal */
	abstract _forEachChild(cb: Function): void;

	/** @internal */
	abstract _anyControls(condition: Function): boolean;

	/** @internal */
	abstract _allControlsDisabled(): boolean;

	/** @internal */
	abstract _syncPendingControls(): boolean;

	/** @internal */
	_anyControlsHaveStatus(status: string): boolean {
		return this._anyControls((control: AbstractControl) => control.status === status);
	}

	/** @internal */
	_anyControlsDirty(): boolean {
		return this._anyControls((control: AbstractControl) => control.dirty);
	}

	/** @internal */
	_anyControlsTouched(): boolean {
		return this._anyControls((control: AbstractControl) => control.touched);
	}

	/** @internal */
	_updatePristine(opts: {onlySelf?: boolean} = {}): void {
		(this as{pristine: boolean}).pristine = !this._anyControlsDirty();

		if (this._parent && !opts.onlySelf) {
			this._parent._updatePristine(opts);
		}
	}

	/** @internal */
	_updateTouched(opts: {onlySelf?: boolean} = {}): void {
		(this as{touched: boolean}).touched = this._anyControlsTouched();

		if (this._parent && !opts.onlySelf) {
			this._parent._updateTouched(opts);
		}
	}

	/** @internal */
	_onDisabledChange: Function[] = [];

	/** @internal */
	_isBoxedValue(formState: any): boolean {
		return typeof formState === 'object' && formState !== null &&
				Object.keys(formState).length === 2 && 'value' in formState && 'disabled' in formState;
	}

	/** @internal */
	_registerOnCollectionChange(fn: () => void): void { this._onCollectionChange = fn; }

	/** @internal */
	_setUpdateStrategy(opts?: ValidatorFn|ValidatorFn[]|AbstractControlOptions|null): void {
		if (isOptionsObj(opts) && (opts as AbstractControlOptions).updateOn != null) {
			this._updateOn = (opts as AbstractControlOptions).updateOn !;
		}
	}

	/**
	 * Check to see if parent has been marked artificially dirty.
	 *
	 * @internal
	 */
	private _parentMarkedDirty(onlySelf?: boolean): boolean {
		const parentDirty = this._parent && this._parent.dirty;
		return !onlySelf && parentDirty && !this._parent._anyControlsDirty();
	}
}
