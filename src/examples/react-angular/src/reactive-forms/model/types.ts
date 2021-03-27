import { Observable } from 'rxjs';
import { AbstractControl } from './AbstractControl';

export type FormHooks = 'change' | 'blur' | 'submit';

/**
 * Reports that a FormControl is valid, meaning that no errors exist in the input value.
 *
 * @see `status`
 */
export const VALID = 'VALID';

/**
 * Reports that a FormControl is invalid, meaning that an error exists in the input value.
 *
 * @see `status`
 */
export const INVALID = 'INVALID';

/**
 * Reports that a FormControl is pending, meaning that that async validation is occurring and
 * errors are not yet available for the input value.
 *
 * @see `markAsPending`
 * @see `status`
 */
export const PENDING = 'PENDING';

/**
 * Reports that a FormControl is disabled, meaning that the control is exempt from ancestor
 * calculations of validity or value.
 *
 * @see `markAsDisabled`
 * @see `status`
 */
export const DISABLED = 'DISABLED';

/**
 * @description
 * Defines the map of errors returned from failed validation checks.
 *
 * @publicApi
 */
export type ValidationErrors = {
	[key: string]: any
};

/**
 * @description
 * An interface implemented by classes that perform synchronous validation.
 *
 * @usageNotes
 *
 * ### Provide a custom validator
 *
 * The following example implements the `Validator` interface to create a
 * validator directive with a custom error key.
 *
 * ```typescript
 * @Directive({
*   selector: '[customValidator]',
*   providers: [{provide: NG_VALIDATORS, useExisting: CustomValidatorDirective, multi: true}]
* })
* class CustomValidatorDirective implements Validator {
*   validate(control: AbstractControl): ValidationErrors|null {
*     return {'custom': true};
*   }
* }
* ```
*
* @publicApi
*/
export interface Validator {
	/**
	 * @description
	 * Method that performs synchronous validation against the provided control.
	 *
	 * @param control The control to validate against.
	 *
	 * @returns A map of validation errors if validation fails,
	 * otherwise null.
	 */
	validate(control: AbstractControl): ValidationErrors|null;

	/**
	 * @description
	 * Registers a callback function to call when the validator inputs change.
	 *
	 * @param fn The callback function
	 */
	registerOnValidatorChange?(fn: () => void): void;
}

/**
 * @description
 * An interface implemented by classes that perform asynchronous validation.
 *
 * @usageNotes
 *
 * ### Provide a custom async validator directive
 *
 * The following example implements the `AsyncValidator` interface to create an
 * async validator directive with a custom error key.
 *
 * ```typescript
 * import { of as observableOf } from 'rxjs';
 *
 * @Directive({
 *   selector: '[customAsyncValidator]',
 *   providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: CustomAsyncValidatorDirective, multi:
 * true}]
 * })
 * class CustomAsyncValidatorDirective implements AsyncValidator {
 *   validate(control: AbstractControl): Observable<ValidationErrors|null> {
 *     return observableOf({'custom': true});
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export interface AsyncValidator extends Validator {
	/**
	 * @description
	 * Method that performs async validation against the provided control.
	 *
	 * @param control The control to validate against.
	 *
	 * @returns A promise or observable that resolves a map of validation errors
	 * if validation fails, otherwise null.
	 */
	validate(control: AbstractControl): Promise<ValidationErrors|null>|Observable<ValidationErrors|null>;
}

/**
 * @description
 * A function that receives a control and synchronously returns a map of
 * validation errors if present, otherwise null.
 *
 * @publicApi
 */
export interface ValidatorFn { (control: AbstractControl): ValidationErrors|null; }

/**
 * @description
 * A function that receives a control and returns a Promise or observable
 * that emits validation errors if present, otherwise null.
 *
 * @publicApi
 */
export interface AsyncValidatorFn {
	(control: AbstractControl): Promise<ValidationErrors|null>|Observable<ValidationErrors|null>;
}

/**
 * Interface for options provided to an `AbstractControl`.
 *
 * @publicApi
 */
export interface AbstractControlOptions {
	/**
	 * @description
	 * The list of validators applied to a control.
	 */
	validators?: ValidatorFn|ValidatorFn[]|null;
	/**
	 * @description
	 * The list of async validators applied to control.
	 */
	asyncValidators?: AsyncValidatorFn|AsyncValidatorFn[]|null;
	/**
	 * @description
	 * The event name for control to update upon.
	 */
	updateOn?: 'change'|'blur'|'submit';
}
