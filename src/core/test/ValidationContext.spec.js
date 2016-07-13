describe('The ValidationContext', function() {
	
	var ValidationContext = require('../../../target/dist/node/ValidationContext');
	var ValidationResult = require('../../../target/dist/node/ValidationResult');
	var vctx;

	beforeEach(function() {
		vctx = new ValidationContext();
		vctx.pushPath('name');
		vctx.popPath();
		vctx.pushPath('address');
		vctx.pushPath('street');
		vctx.setCurrentConstraintName('streetConstraint');
		vctx.setMessage('streetConstraintMessage');
		vctx.addResult(false);
		vctx.popPath();
		vctx.pushPath('number');
		vctx.popPath();
		vctx.popPath();
		vctx.pushPath('pets');
		vctx.setCurrentConstraintName('petsConstraint');
		vctx.addResult(false);
		vctx.pushPath(0);
		vctx.pushPath('name');
		vctx.popPath();
		vctx.popPath();
		vctx.popPath();
	});

	it('should construct the correct results', function() {
		expect(vctx.result).toEqual({
			_thisValid: true,
			_childrenValid: false,
			_validity: null,
			_children: {
				name: {
					_thisValid: true,
					_validity: null,
					_children: null
				},
				address: {
					_thisValid: true,
					_childrenValid: false,
					_validity: null,
					_children: {
						street: {
							_thisValid: false,
							_validity: {
								streetConstraint: new ValidationResult(false,'streetConstraintMessage',null)
							},
							_children: null
						},
						number: {
							_thisValid: true,
							_validity: null,
							_children: null
						}
					}
				},
				pets: {
					_thisValid: false,
					_childrenValid: true,
					_validity: {
						petsConstraint: new ValidationResult(false,null,null)
					},
					_children: [
						{
							_thisValid: true,
							_childrenValid: true,
							_validity: null,
							_children: {
								name: {
									_thisValid: true,
									_validity: null,
									_children: null
								}
							}
						}
					]
				}
			}
		});
	});

	describe('hasValidationErrors method', function() {
		it('reports the correct value for this object', function() {
			expect(vctx.hasValidationErrors()).toBe(true);
			vctx.result._childrenValid = true;
			expect(vctx.hasValidationErrors()).toBe(false);
		});

		it('reports the correct value for a path validation result', function() {
			expect(vctx.hasValidationErrors({_thisValid: false})).toBe(true);
			expect(vctx.hasValidationErrors({_thisValid: true})).toBe(false);
			expect(vctx.hasValidationErrors({_thisValid: false, _childrenValid: true})).toBe(true);
			expect(vctx.hasValidationErrors({_thisValid: false, _childrenValid: false})).toBe(true);
			expect(vctx.hasValidationErrors({_thisValid: true, _childrenValid: false})).toBe(true);
			expect(vctx.hasValidationErrors({_thisValid: true, _childrenValid: true})).toBe(false);
		});
	});

	describe('getModelPath/getParent methods', function() {
		var model;

		beforeEach(function() {
			model = { name: 'Bob', address: { city: 'Bikini Bottom' }, friends: [{ name: 'Patrick', surname: 'Star' }, { name: 'Squidward', surname: 'Tentacles' } ] };
			vctx = new ValidationContext(model);
		});

		it('retrieves the current node when called with 0 or no argument', function() {
			vctx.pushPath('name', 'Bob');
			expect(vctx.getModelPath()).toEqual({ path: 'name', value: model.name });
			expect(vctx.getModelPath(0)).toEqual({ path: 'name', value: model.name });
		});

		it('retrieves the parent node when called with index > 0', function() {
			vctx.pushPath('friends', model.friends);
			vctx.pushPath(0, model.friends[0]);
			vctx.pushPath('name', 'Patrick');

			expect(vctx.getModelPath(1)).toEqual({ path: 0, value: { name: 'Patrick', surname: 'Star' } });
			expect(vctx.getParent()).toEqual({ path: 0, value: { name: 'Patrick', surname: 'Star' } });
			expect(vctx.getParent(0)).toEqual({ path: 0, value: { name: 'Patrick', surname: 'Star' } });

			expect(vctx.getModelPath(2)).toEqual({ path: 'friends', value: model.friends });
			expect(vctx.getParent(1)).toEqual({ path: 'friends', value: model.friends });
		});

		it('throws for negative index', function() {
			expect(function() {
				vctx.getModelPath(-1);
			}).toThrow();
		});

		it('throws for index greater than the current model depth - 1', function() {
			vctx.pushPath('name', 'Bob');
			expect(function() {
				vctx.getModelPath(1);
			}).not.toThrow();
			expect(function() {
				vctx.getModelPath(2);
			}).toThrow();
		});
	});

	describe('prependParentPath method', function() {
		var model;

		beforeEach(function() {
			model = { name: 'Bob' };
			vctx = new ValidationContext(model);
		});

		it('adds ValidationPathEntry objects at the front of the model path', function() {
			vctx.prependParentPath({id: 'parent 1'}, 'p1');
			vctx.prependParentPath({id: 'parent 2'});
			vctx.prependParentPath({id: 'parent 3'}, 'p3');
			expect(vctx.getParent()).toEqual({ path: 'p1',  value: {id: 'parent 1'} });
			expect(vctx.getParent(1)).toEqual({ path: '',   value: {id: 'parent 2'} });
			expect(vctx.getParent(2)).toEqual({ path: 'p3', value: {id: 'parent 3'} });
		});
	});

	describe('appendParentPath method', function() {
		var model;

		beforeEach(function() {
			model = { name: 'Bob' };
			vctx = new ValidationContext(model);
		});

		it('adds ValidationPathEntry objects before the root object in the model path', function() {
			vctx.appendParentPath({id: 'parent 1'}, 'p1');
			vctx.appendParentPath({id: 'parent 2'});
			vctx.appendParentPath({id: 'parent 3'}, 'p3');
			expect(vctx.getParent()).toEqual({ path: 'p3',  value: {id: 'parent 3'} });
			expect(vctx.getParent(1)).toEqual({ path: '',   value: {id: 'parent 2'} });
			expect(vctx.getParent(2)).toEqual({ path: 'p1', value: {id: 'parent 1'} });
		});
	});

	it('appendParentPath and prependParentPath methods work well together', function() {
		var model = { name: 'Bob' };
		vctx = new ValidationContext(model);
		vctx.prependParentPath({id: 'parent 1'}, 'p1');
		vctx.appendParentPath({id: 'parent 2'});
		vctx.prependParentPath({id: 'parent 3'}, 'p3');
		vctx.appendParentPath({id: 'parent 4'});
		// mode path should be [3 1 2 4 root]
		expect(vctx.getParent()).toEqual({ path: '',    value: {id: 'parent 4'} });
		expect(vctx.getParent(1)).toEqual({ path: '',   value: {id: 'parent 2'} });
		expect(vctx.getParent(2)).toEqual({ path: 'p1', value: {id: 'parent 1'} });
		expect(vctx.getParent(3)).toEqual({ path: 'p3', value: {id: 'parent 3'} });
	});
});
