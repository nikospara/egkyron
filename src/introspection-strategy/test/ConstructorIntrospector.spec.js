describe('The ConstructorIntrospector', function() {
	
	var ConstructorIntrospector = require('../../../target/dist/node/introspection-strategy/ConstructorIntrospector'), sut;

	function Model() {
		this.prop1 = null;
	}

	Model.validators = {
		prop1: ['required']
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

	describe('when enumerating the model properties', function() {
		var callback, r;

		beforeEach(function() {
			callback = jasmine.createSpy('callback');
		});

		it('should not invoke the callback if the model is null', function() {
			r = sut.enumerateProps(null, null, null, callback);
			expect(r).toBe(true);
			expect(callback).not.toHaveBeenCalled();
		});

		it('should not invoke the callback if the model is empty', function() {
			r = sut.enumerateProps(null, [], null, callback);
			expect(r).toBe(true);
			expect(callback).not.toHaveBeenCalled();
			r = sut.enumerateProps(null, {}, null, callback);
			expect(r).toBe(true);
			expect(callback).not.toHaveBeenCalled();
		});

		it('should invoke the callback once for each model property (for objects)', function() {
			r = sut.enumerateProps(null, {x:1, y:'q'}, null, callback);
			expect(r).toBe(true);
			expect(callback).toHaveBeenCalledWith('x');
			expect(callback).toHaveBeenCalledWith('y');
			expect(callback.calls.count()).toBe(2);
		});

		it('should invoke the callback once for each model index (for arrays)', function() {
			r = sut.enumerateProps(null, ['a','b'], null, callback);
			expect(r).toBe(true);
			expect(callback).toHaveBeenCalledWith(0);
			expect(callback).toHaveBeenCalledWith(1);
			expect(callback.calls.count()).toBe(2);
		});

		it('should stop the enumeration if the callback returns false, and return false itself', function() {
			callback = jasmine.createSpy('callback').and.returnValue(false);
			r = sut.enumerateProps(null, ['a','b'], null, callback);
			expect(r).toBe(false);
			expect(callback).toHaveBeenCalledWith(0);
			expect(callback.calls.count()).toBe(1);
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
