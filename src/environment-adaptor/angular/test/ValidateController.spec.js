describe('The ValidateController', function() {

	var
		scope, elem, sut, ngModel, ValidationResult, validatorMock, processedModelExpressionMock, validationArgsMock, resultsMock,
		parentValidateMock, PARENT_CHILD_TYPE = 'parentChildType', ROOT_TYPE = 'rootType', THIS_CHILD_TYPE1 = 'thisChildType1', THIS_CHILD_TYPE2 = 'thisChildType2';

	beforeEach(module('egkyron', function($compileProvider) {
		// the ValidateController is supposed to be used by a directive, we simulate that here
		$compileProvider.directive('validate', function() {
			return {
				restrict: 'A',
				priority: 10,
				scope: false,
				controller: 'ValidateController',
				require: ['validate', 'ngModel'],
				link: function(scope, elem, attrs, ctrls) {
					sut = ctrls[0];
					ngModel = ctrls[1];
				}
			};
		});
	}));

	beforeEach(inject(function($rootScope, _ValidationResult_) {
		scope = $rootScope.$new();
		ValidationResult = _ValidationResult_;
	}));

	beforeEach(function() {
		resultsMock = null;

		validatorMock = jasmine.createSpyObj('validatorMock', ['evaluateConstraints']);
		validatorMock.evaluateConstraints.and.callFake(function(vctx, constraints, ctxObject, value, eager, groups) {
			vctx.result = resultsMock;
		});

		validatorMock.introspectionStrategy = jasmine.createSpyObj('introspectionStrategyMock', ['processModelExpression', 'findType', 'prepareValidationFromScope']);
		validatorMock.introspectionStrategy.findType.and.callFake(function(vctx, parentType, propName) {
			if( parentType ) {
				if( parentType === PARENT_CHILD_TYPE && propName === 'x' ) return THIS_CHILD_TYPE1;
				else if( parentType === ROOT_TYPE && propName === 'x' ) return THIS_CHILD_TYPE2;
				else throw new Error('Unexpected: findType(' + parentType + ',' + propName + ')');
			}
			else {
				return ROOT_TYPE;
			}
		});

		validationArgsMock = {};
		validatorMock.introspectionStrategy.prepareValidationFromScope.and.returnValue(validationArgsMock);

		processedModelExpressionMock = jasmine.createSpyObj('processedModelExpressionMock', ['propNameGetter']);
		processedModelExpressionMock.propNameGetter.and.returnValue('x');

		validatorMock.introspectionStrategy.processModelExpression.and.returnValue(processedModelExpressionMock);

		parentValidateMock = jasmine.createSpyObj('parentValidateMock', ['getChildType']);
		parentValidateMock.getChildType.and.returnValue(PARENT_CHILD_TYPE);

		elem = compile('<form><input ng-model="model.x" validate /></form>');
	});

	afterEach(function() {
		scope.$destroy();
	});

	function compile(html) {
		var elem;
		inject(function($compile) {
			elem = $compile(html)(scope);
		});
		scope.$digest();
		return elem;
	}

	describe('when calling configure()', function() {
		it('should throw if either ngModel or validator are null', function() {
			expect(function() {
				sut.configure();
			}).toThrow();
			expect(function() {
				sut.configure({});
			}).toThrow();
		});

		it('should set the `validate` validator', function() {
			sut.configure(ngModel, validatorMock, parentValidateMock);
			expect(ngModel.$validators.validate).toBeDefined();
		});

		it('should set the type from the parent childType, if there is a parent, and the appropriate childType', function() {
			sut.configure(ngModel, validatorMock, parentValidateMock);
			expect(sut.getType()).toBe(PARENT_CHILD_TYPE);
			expect(sut.getChildType()).toBe(THIS_CHILD_TYPE1);
		});

		it('should set the type from the root type, if there is no parent, and the appropriate childType', function() {
			sut.configure(ngModel, validatorMock);
			expect(sut.getType()).toBe(ROOT_TYPE);
			expect(sut.getChildType()).toBe(THIS_CHILD_TYPE2);
		});

		it('should honour the overriden getType() when determining the childType', function() {
			sut.getType = function() {
				return ROOT_TYPE;
			};
			sut.configure(ngModel, validatorMock, parentValidateMock);
			expect(sut.getChildType()).toBe(THIS_CHILD_TYPE2);
		});
	});

	it('should validate on input', function() {
		var input = angular.element(elem[0].querySelector('input'));
		sut.handleMessage = jasmine.createSpy('handleMessage');
		sut.configure(ngModel, validatorMock);
		input.val('a').triggerHandler('input');
		expect(ngModel.$valid).toBe(true);

		resultsMock = {
			_thisValid: false,
			_validity: {
				streetConstraint: new ValidationResult(false,'streetConstraintMessage',null)
			}
		};
		input.val('ab').triggerHandler('input');
		expect(ngModel.$valid).toBe(false);
		expect(sut.handleMessage).toHaveBeenCalledWith('streetConstraint', resultsMock._validity.streetConstraint);
	});

	it('should revalidate on some other model change only if the watch is activated', function() {
		sut.configure(ngModel, validatorMock);
		scope.$digest();
		expect(ngModel.$valid).toBe(true);

		sut.watchValidity();
		scope.$digest();

		resultsMock = {
			_thisValid: false,
			_validity: {
				streetConstraint: new ValidationResult(false,'streetConstraintMessage',null)
			}
		};
		sut.watchValidity();
		scope.$digest();
		expect(ngModel.$valid).toBe(false);

		sut.unwatchValidity();
		resultsMock = {
			_thisValid: true,
			_validity: {
				streetConstraint: new ValidationResult(true,'streetConstraintMessage',null)
			}
		};
		scope.$digest();
		expect(ngModel.$valid).toBe(false);
	});

	it('gets the model value', function() {
		sut.configure(ngModel, validatorMock);
		scope.model = { x: 123 };
		scope.$digest();
		expect(sut.getModelValue()).toBe(123);
	});

	it('knows its parent', function() {
		sut.configure(ngModel, validatorMock, parentValidateMock);
		expect(sut.getParentValidate()).toBe(parentValidateMock);
	});

	it('extends the ValidationContext so that getModelPath/getParent work correctly', function() {
		parentValidateMock.getModelValue = function() { return {id: 'the parent'}; };
		parentValidateMock.getParentValidate = function() { return null; };
		spyOn(sut, 'calculateParentPath').and.callThrough();
		sut.configure(ngModel, validatorMock, parentValidateMock);
		var input = angular.element(elem[0].querySelector('input'));
		input.val('a').triggerHandler('input');
		var vctx = validatorMock.evaluateConstraints.calls.mostRecent().args[0];
		expect(vctx.getParent()).toEqual({ path: '', value: {id: 'the parent'} });
		expect(sut.calculateParentPath.calls.count()).toBe(1);
		// make sure calculateParentPath is never called again
		expect(vctx.getParent()).toEqual({ path: '', value: {id: 'the parent'} });
		expect(sut.calculateParentPath.calls.count()).toBe(1);
	});
});
