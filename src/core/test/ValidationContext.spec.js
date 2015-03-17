describe('The ValidationContext', function() {
	
	var ValidationContext = require('../../../target/dist/node/ValidationContext'),
		ValidationResult = require('../../../target/dist/node/ValidationResult');

	it('should construct the correct results', function() {
		var vctx = new ValidationContext();
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
});
