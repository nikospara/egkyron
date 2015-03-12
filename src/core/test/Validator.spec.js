describe('The Validator', function() {

	var Validator, registry, passValidator, failValidator;

	Validator = require('../../../target/dist/core/node/Validator');

	registry = {
		getRegisteredValidator: function(name) {
			return name === 'passValidator' ? passValidator : (name === 'failValidator' ? failValidator : null);
		}
	};

	beforeEach(function() {
		passValidator = jasmine.createSpy('xxx').and.returnValue(true);
		failValidator = jasmine.createSpy('xxx').and.returnValue(false);
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
		var vctx, ctxObject = {}, value = "THE VALUE";

		beforeEach(function() {
			vctx = jasmine.createSpyObj('vctx', ['setCurrentConstraintName', 'addResult']);
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
		var introspector;

		beforeEach(function() {
			introspector = jasmine.createSpyObj('introspector', ['extractConstraintsFromContext', 'enumerateProps', 'evaluate', 'findType']);
		});
	});
});
