export function Validators(validators: any): ClassDecorator {
	return <TFunction>(target: TFunction) => {
		(target as any).validators = validators;
		return target;
	};
}
