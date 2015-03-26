describe('The Validator', function() {

	var Validator, registry, passValidator, failValidator;

	Validator = require('../../../target/dist/node/Validator');

	registry = {
		getRegisteredValidator: function(name) {
			return name === 'passValidator' ? passValidator : (name === 'failValidator' ? failValidator : null);
		}
	};

	beforeEach(function() {
		passValidator = jasmine.createSpy('passValidator').and.returnValue(true);
		failValidator = jasmine.createSpy('failValidator').and.returnValue(false);
	});

	describe('normalizeConstraint method', function() {
		it('should normalize a single string contstraint', function() {
			var v = new Validator(registry), c = v.normalizeConstraint('passValidator');
			expect(c).toBeDefined();
			expect(c).not.toBeNull();
			expect(c.key).toBe('passValidator');
			expect(c.validator).toBe(passValidator);
			expect(c.params).toEqual({groups: Validator.DEFAULT_GROUPS});
		});

		it('should throw if it cannot find the validator under the given key', function() {
			var v = new Validator(registry);
			expect(function() {
				v.normalizeConstraint('unregisteredValidator');
			}).toThrow();
		});

		it('should normalize an array [string, object]', function() {
			var v = new Validator(registry), c = v.normalizeConstraint(['passValidator',{x:1}]);
			expect(c).toBeDefined();
			expect(c).not.toBeNull();
			expect(c.key).toBe('passValidator');
			expect(c.validator).toBe(passValidator);
			expect(c.params).toEqual({x:1, groups: Validator.DEFAULT_GROUPS});
		});

		it('should respect the overriden groups', function() {
			var v = new Validator(registry), c = v.normalizeConstraint(['passValidator',{x:1, groups: ['A','B']}]);
			expect(c).toBeDefined();
			expect(c).not.toBeNull();
			expect(c.key).toBe('passValidator');
			expect(c.validator).toBe(passValidator);
			expect(c.params).toEqual({x:1, groups: ['A','B']});
		});

		it('should normalize an array [string, string, object]', function() {
			var v = new Validator(registry), c = v.normalizeConstraint(['otherkey', 'passValidator', {x:1}]);
			expect(c).toBeDefined();
			expect(c).not.toBeNull();
			expect(c.key).toBe('otherkey');
			expect(c.validator).toBe(passValidator);
			expect(c.params).toEqual({x:1, groups: Validator.DEFAULT_GROUPS});
		});

		it('should normalize an array [string, function, object]', function() {
			var v = new Validator(registry), c;

			function validatorFunction() {
				// INTENTIONALLY BLANK
			}

			c = v.normalizeConstraint(['otherkey', validatorFunction, {x:1}]);
			expect(c).toBeDefined();
			expect(c).not.toBeNull();
			expect(c.key).toBe('otherkey');
			expect(c.validator).toBe(validatorFunction);
			expect(c.params).toEqual({x:1, groups: Validator.DEFAULT_GROUPS});
		});
	});

	describe('normalizeConstraints method', function() {
		it('should return a Constraint array', function() {
			var v = new Validator(registry), c = v.normalizeConstraints(['passValidator']);
			expect(c).toBeDefined();
			expect(c).not.toBeNull();
			expect(c.length).toBe(1);
			expect(c[0].key).toBe('passValidator');
			expect(c[0].validator).toBe(passValidator);
			expect(c[0].params).toEqual({groups: Validator.DEFAULT_GROUPS});
		});

		it('should cache the result', function() {
			var v = new Validator(registry), c0 = ['passValidator'], c1, c2;
			c1 = v.normalizeConstraints(c0);
			c2 = v.normalizeConstraints(c0);
			expect(c1).toBe(c2);
		});
	});

	describe('evaluateConstraints method', function() {
		var vctx, ctxObject = {}, value = 'THE VALUE';

		beforeEach(function() {
			vctx = jasmine.createSpyObj('vctx', ['setCurrentConstraintName', 'addResult']);
		});

		it('should accept null/undefined constraints and treat them as no constraints', function() {
			var v = new Validator(registry);
			v.evaluateConstraints(vctx, null, ctxObject, value);
			expect(vctx.setCurrentConstraintName).not.toHaveBeenCalled();
		});

		it('should report the correct validation results', function() {
			var v = new Validator(registry), constraints = ['failValidator', 'passValidator'];

			v.evaluateConstraints(vctx, constraints, ctxObject, value);

			expect(vctx.setCurrentConstraintName.calls.allArgs()).toEqual([['failValidator'], [null], ['passValidator'], [null]]);
			expect(failValidator.calls.count()).toBe(1);
			expect(failValidator.calls.all()[0]).toEqual({object: ctxObject, args: [value, {groups: Validator.DEFAULT_GROUPS}, vctx], returnValue: false});
			expect(passValidator.calls.count()).toBe(1);
			expect(passValidator.calls.all()[0]).toEqual({object: ctxObject, args: [value, {groups: Validator.DEFAULT_GROUPS}, vctx], returnValue: true});
			expect(vctx.addResult.calls.allArgs()).toEqual([[false], [true]]);
		});

		it('honours the eager flag', function() {
			var v = new Validator(registry), constraints = ['failValidator', 'passValidator'];

			v.evaluateConstraints(vctx, constraints, ctxObject, value, true);

			expect(vctx.setCurrentConstraintName.calls.allArgs()).toEqual([['failValidator'], [null]]);
			expect(failValidator.calls.count()).toBe(1);
			expect(failValidator.calls.all()[0]).toEqual({object: ctxObject, args: [value, {groups: Validator.DEFAULT_GROUPS}, vctx], returnValue: false});
			expect(passValidator.calls.count()).toBe(0);
			expect(vctx.addResult.calls.allArgs()).toEqual([[false]]);
		});

		it('honours the groups', function() {
			var v = new Validator(registry), constraints = ['failValidator', ['passValidator', {groups: ['A']}]];

			v.evaluateConstraints(vctx, constraints, ctxObject, value, true, ['A']);

			expect(vctx.setCurrentConstraintName.calls.allArgs()).toEqual([['passValidator'], [null]]);
			expect(passValidator.calls.count()).toBe(1);
			expect(passValidator.calls.all()[0]).toEqual({object: ctxObject, args: [value, {groups: ['A']}, vctx], returnValue: true});
			expect(failValidator.calls.count()).toBe(0);
			expect(vctx.addResult.calls.allArgs()).toEqual([[true]]);
		});
	});

	describe('validateProperties method', function() {
		var vctx, introspectionStrategy, v, model = {}, TYPE = 'THE_TYPE', PROPNAME0 = 'PROPNAME0', PROPNAME1 = 'PROPNAME1', value = 'THE VALUE', hasValidationErrors = false, innerModel;

		beforeEach(function() {
			vctx = jasmine.createSpyObj('vctx', ['pushPath', 'popPath', 'hasValidationErrors']);
			introspectionStrategy = jasmine.createSpyObj('introspectionStrategy', ['extractConstraintsFromContext', 'enumerateProps', 'evaluate', 'findType']);
			v = new Validator(registry, introspectionStrategy);
		});

		it('should iterate the properties of the model', function() {
			var enumeratePropsArgs, callback;
			v.validateProperties(vctx, model, TYPE);
			enumeratePropsArgs = introspectionStrategy.enumerateProps.calls.mostRecent().args;
			expect(enumeratePropsArgs.slice(0,3)).toEqual([vctx, model, TYPE]);
			callback = enumeratePropsArgs[3];
			expect(typeof callback).toBe('function');
		});

		it('should skip a property if not defined in the props argument', function() {
			var enumeratePropsArgs, callback;
			v.validateProperties(vctx, model, TYPE, false, Validator.DEFAULT_GROUPS, [PROPNAME1]);
			enumeratePropsArgs = introspectionStrategy.enumerateProps.calls.mostRecent().args;
			expect(enumeratePropsArgs.slice(0,3)).toEqual([vctx, model, TYPE]);
			callback = enumeratePropsArgs[3];
			callback(PROPNAME0);
			expect(vctx.pushPath).not.toHaveBeenCalled();
			expect(vctx.popPath).not.toHaveBeenCalled();
			expect(introspectionStrategy.extractConstraintsFromContext).not.toHaveBeenCalled();
			expect(introspectionStrategy.evaluate).not.toHaveBeenCalled();
			expect(introspectionStrategy.findType).not.toHaveBeenCalled();
		});

		describe('should iterate the properties of the model with a callback that', function() {
			var callback;

			beforeEach(function() {
				vctx = jasmine.createSpyObj('vctx', ['pushPath', 'popPath', 'hasValidationErrors']);
				introspectionStrategy = jasmine.createSpyObj('introspectionStrategy', ['extractConstraintsFromContext', 'enumerateProps', 'evaluate', 'findType']);
				v = new Validator(registry, introspectionStrategy);

				v.validateProperties(vctx, model, TYPE);
				callback = introspectionStrategy.enumerateProps.calls.mostRecent().args[3];
			});

			it('manages the validation path correctly', function() {
				callback(PROPNAME0);
				expect(vctx.pushPath.calls.mostRecent().args).toEqual([PROPNAME0]);
				expect(vctx.pushPath.calls.count()).toBe(1);
				expect(vctx.popPath.calls.count()).toBe(1);
			});

			it('calls extractConstraintsFromContext to extract the constraints', function() {
				callback(PROPNAME0);
				expect(introspectionStrategy.extractConstraintsFromContext.calls.count()).toBe(1);
				expect(introspectionStrategy.extractConstraintsFromContext.calls.mostRecent().args).toEqual([vctx, model, TYPE, PROPNAME0]);
			});

			it('calls introspectionStrategy.evaluate to evaluate the value of the property', function() {
				callback(PROPNAME0);
				expect(introspectionStrategy.evaluate.calls.count()).toBe(1);
				expect(introspectionStrategy.evaluate.calls.mostRecent().args).toEqual([model, PROPNAME0, TYPE, vctx]);
			});
		});

		function createComplexFixture() {
			vctx = jasmine.createSpyObj('vctx', ['pushPath', 'popPath', 'hasValidationErrors']);
			introspectionStrategy = jasmine.createSpyObj('introspectionStrategy', ['extractConstraintsFromContext', 'enumerateProps', 'evaluate', 'findType']);
			v = new Validator(registry, introspectionStrategy);

			innerModel = {};
			innerModel[PROPNAME0] = value;
			innerModel[PROPNAME1] = value;
			model[PROPNAME0] = innerModel;
			model[PROPNAME1] = { the_value: value };

			vctx.hasValidationErrors.and.callFake(function() {
				return hasValidationErrors;
			});

			introspectionStrategy.enumerateProps.and.callFake(function(vc, o, t, cb) {
				var ret;

				if( o === model ) {
					hasValidationErrors = false;
					ret = cb(PROPNAME0);
					hasValidationErrors = false;
					if( ret !== false ) ret = cb(PROPNAME1);
				}
				else if( o === innerModel ) {
					hasValidationErrors = true;
					ret = cb(PROPNAME0);
					hasValidationErrors = false;
					if( ret !== false ) ret = cb(PROPNAME1);
				}
				else {
					for( var x in o ) {
						if( !o.hasOwnProperty(x) ) continue;
						hasValidationErrors = false;
						ret = cb(x);
						if( ret === false ) {
							break;
						}
					}
				}

				if( ret === false ) {
					return false;
				}
			});

			introspectionStrategy.evaluate.and.callFake(function(o, propName) {
				return o[propName];
			});
		}

		it('recurses for the properties of the model', function() {
			createComplexFixture();
			v.validateProperties(vctx, model, TYPE, false);
			expect(introspectionStrategy.evaluate.calls.count()).toBe(5);
			expect(introspectionStrategy.evaluate.calls.argsFor(0)).toEqual([model, PROPNAME0, TYPE, vctx]);
			expect(introspectionStrategy.evaluate.calls.argsFor(1)).toEqual([innerModel, PROPNAME0, undefined, vctx]);
			expect(introspectionStrategy.evaluate.calls.argsFor(2)).toEqual([innerModel, PROPNAME1, undefined, vctx]);
			expect(introspectionStrategy.evaluate.calls.argsFor(3)).toEqual([model, PROPNAME1, TYPE, vctx]);
			expect(introspectionStrategy.evaluate.calls.argsFor(4)).toEqual([model[PROPNAME1], 'the_value', undefined, vctx]);
		});

		it('exits eagerly, if eager is true', function() {
			createComplexFixture();
			v.validateProperties(vctx, model, TYPE, true);
			expect(introspectionStrategy.evaluate.calls.count()).toBe(2);
			expect(introspectionStrategy.evaluate.calls.argsFor(0)).toEqual([model, PROPNAME0, TYPE, vctx]);
			expect(introspectionStrategy.evaluate.calls.argsFor(1)).toEqual([innerModel, PROPNAME0, undefined, vctx]);
		});
	});

	describe('validate method', function() {
		var v, vctx;

		beforeEach(function() {
			v = new Validator();
			v.introspectionStrategy = jasmine.createSpyObj('introspectionStrategy', ['findType']);
			v.introspectionStrategy.findType.and.returnValue(null);
			spyOn(v, 'validateProperties');
		});

		it('accepts a null/undefined model and returns valid without calling the inner methods', function() {
			vctx = v.validate();
			expect(vctx.result._thisValid).toBe(true);
			expect(vctx.result._childrenValid).toBeUndefined();
			expect(v.validateProperties).not.toHaveBeenCalled();
		});

		it('passes the model to validateProperties() with eager=false', function() {
			var model = {};
			vctx = v.validate(model);
			expect(v.validateProperties).toHaveBeenCalledWith(vctx, model, null, false, null, null);
		});

		it('passes eager to validateProperties()', function() {
			var model = {};
			vctx = v.validate(model, true);
			expect(v.validateProperties).toHaveBeenCalledWith(vctx, model, null, true, null, null);
		});

		it('eager is optional, and groups are passed on to validateProperties()', function() {
			var model = {};
			vctx = v.validate(model, ['GROUPS']);
			expect(v.validateProperties).toHaveBeenCalledWith(vctx, model, null, false, ['GROUPS'], null);
		});

		it('both eager and groups can be specified', function() {
			var model = {};
			vctx = v.validate(model, true, ['GROUPS']);
			expect(v.validateProperties).toHaveBeenCalledWith(vctx, model, null, true, ['GROUPS'], null);
		});

		it('any extra arguments are passed on as props', function() {
			var model = {};
			vctx = v.validate(model, true, ['GROUPS'], 'foo', 'bar');
			expect(v.validateProperties).toHaveBeenCalledWith(vctx, model, null, true, ['GROUPS'], ['foo', 'bar']);
		});

		it('any extra arguments are passed on as props, and groups can be omitted', function() {
			var model = {};
			vctx = v.validate(model, true, 'foo', 'bar');
			expect(v.validateProperties).toHaveBeenCalledWith(vctx, model, null, true, null, ['foo', 'bar']);
		});

		it('any extra arguments are passed on as props, and eager can be omitted', function() {
			var model = {};
			vctx = v.validate(model, ['GROUPS'], 'foo', 'bar');
			expect(v.validateProperties).toHaveBeenCalledWith(vctx, model, null, false, ['GROUPS'], ['foo', 'bar']);
		});

		it('any extra arguments are passed on as props, and both groups and eager can be omitted', function() {
			var model = {};
			vctx = v.validate(model, 'foo', 'bar');
			expect(v.validateProperties).toHaveBeenCalledWith(vctx, model, null, false, null, ['foo', 'bar']);
		});
	});
});
