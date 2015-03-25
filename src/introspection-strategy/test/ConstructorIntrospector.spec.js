describe('The ConstructorIntrospector', function() {
	
	var ConstructorIntrospector = require('../../../target/dist/node/introspection-strategy/ConstructorIntrospector'), sut;

	function Model() {
		this.prop1 = null;
		this.prop2 = null;
	}

	Model.validators = {
		prop1: ['required'],
		prop2: ['required'],
		propX: ['required']
	};

	beforeEach(function() {
		sut = new ConstructorIntrospector();
	});

	describe('when extracting the constraints', function() {
		it('should return an empty array, if the model is null/undefined', function() {
			expect(sut.extractConstraintsFromContext()).toEqual([]);
			expect(sut.extractConstraintsFromContext(null, null)).toEqual([]);
			expect(sut.extractConstraintsFromContext(null, null, null, 'x')).toEqual([]);
		});

		it('should return an empty array, if the propertyName is null/undefined', function() {
			expect(sut.extractConstraintsFromContext(null, new Model(), null)).toEqual([]);
			expect(sut.extractConstraintsFromContext(null, new Model(), null, null)).toEqual([]);
		});

		it('should return the correct constraints', function() {
			expect(sut.extractConstraintsFromContext(null, new Model(), null, 'prop1')).toEqual(Model.validators.prop1);
		});
	});

	describe('when evaluating a model property', function() {
		it('should return undefined for null/undefined model', function() {
			expect(sut.evaluate()).toBeUndefined();
			expect(sut.evaluate(null)).toBeUndefined();
		});

		it('should return the property value', function() {
			expect(sut.evaluate()).toBeUndefined();
			expect(sut.evaluate({i:1, j:'a', k:true}, 'j')).toBe('a');
		});
	});
});
