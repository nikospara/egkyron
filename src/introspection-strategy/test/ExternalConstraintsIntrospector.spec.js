describe('The ExternalConstraintsIntrospector', function() {
	
	var ExternalConstraintsIntrospector = require('../../../target/dist/node/introspection-strategy/ExternalConstraintsIntrospector'), sut, rules;

	rules = {
		Root: {
			prop1: 'required',
			prop2: ['required'],
			prop3: {
				type: 'Child',
				validators: 'required'
			},
			prop4: {
				type: 'Child',
				validators: ['required']
			},
			prop5: {
				type: 'Child',
				validators: 111 // INVALID ON PURPOSE
			},
			prop6: {
				type: 'Child'
				// NO VALIDATORS => EMPTY ARRAY
			}
		},
		Child: {
			prop1: 'xxx'
		}
	};

	beforeEach(function() {
		sut = new ExternalConstraintsIntrospector(rules, 'Root');
	});

	describe('when extracting the constraints', function() {
		it('should throw if the rules are not defined', function() {
			delete sut.rules;
			expect(function() {
				sut.extractConstraintsFromContext(null, null, 'Root', 'prop1');
			}).toThrow();
		});

		it('should return an empty array, if the type is null/undefined', function() {
			expect(sut.extractConstraintsFromContext(null, null, null, 'prop1')).toEqual([]);
		});

		it('should return an empty array, if the type does not exist', function() {
			expect(sut.extractConstraintsFromContext(null, null, 'DoesNotExist', 'prop1')).toEqual([]);
		});

		it('should return an empty array, if the propertyName is null/undefined', function() {
			expect(sut.extractConstraintsFromContext(null, null, 'Root', null)).toEqual([]);
		});

		it('accepts a single string as value', function() {
			expect(sut.extractConstraintsFromContext(null, null, 'Root', 'prop1')).toEqual(['required']);
		});

		it('accepts an array as value', function() {
			expect(sut.extractConstraintsFromContext(null, null, 'Root', 'prop2')).toEqual(['required']);
		});

		it('accepts an object with a `validators` property that is a single string as value', function() {
			expect(sut.extractConstraintsFromContext(null, null, 'Root', 'prop3')).toEqual(['required']);
		});

		it('accepts an object with a `validators` property that is an array as value', function() {
			expect(sut.extractConstraintsFromContext(null, null, 'Root', 'prop4')).toEqual(['required']);
		});

		it('throws if the value is an object with a `validators` property that cannot be recognized', function() {
			expect(function() {
				sut.extractConstraintsFromContext(null, null, 'Root', 'prop5');
			}).toThrow();
		});

		it('accepts an object with no `validators` property and returns an empty array', function() {
			expect(sut.extractConstraintsFromContext(null, null, 'Root', 'prop6')).toEqual([]);
		});
	});

	describe('when calling extractValidatorsFromModel', function() {
		it('should throw if the rules are not defined', function() {
			delete sut.rules;
			expect(function() {
				sut.extractValidatorsFromModel();
			}).toThrow();
		});

		it('returns an empty object, if the type is null/undefined', function() {
			expect(sut.extractValidatorsFromModel(null, null, null)).toEqual({});
			expect(sut.extractValidatorsFromModel(null, null)).toEqual({});
		});

		it('returns the correct validators', function() {
			expect(sut.extractValidatorsFromModel(null, null, 'Root')).toEqual(rules.Root);
		});
	});

	describe('when calling findType', function() {
		it('should throw if the rules are not defined', function() {
			delete sut.rules;
			expect(function() {
				sut.findType();
			}).toThrow();
		});

		it('should return the configured rootType if both the `parentType` and the `propName` are null', function() {
			expect(sut.findType(null, null, null)).toBe('Root');
		});

		it('should return null if the `parentType` is null or does not exist', function() {
			expect(sut.findType(null, null, 'prop1')).toBeNull();
			expect(sut.findType(null, 'DoesNotExist', 'prop1')).toBeNull();
		});

		it('should return the array element type, if the parent type is an array', function() {
			expect(sut.findType(null, 'Child[]')).toBe('Child');
		});

		it('should return null if the `parentType` does not have the given property, or the given property does not have `type`', function() {
			expect(sut.findType(null, 'Root', 'doesNotExist')).toBeNull();
			expect(sut.findType(null, 'Root', 'prop1')).toBeNull();
		});

		it('should return the `type`', function() {
			expect(sut.findType(null, 'Root', 'prop4')).toBe('Child');
			expect(sut.findType(null, 'Root', 'prop5')).toBe('Child');
			expect(sut.findType(null, 'Root', 'prop6')).toBe('Child');
		});
	});
});
