describe('The ValidationContext', function() {
	
	var ValidationContext = require('../../../target/dist/core/node/ValidationContext');

	it('should construct the correct path when pushing/popping', function() {
		var vctx = new ValidationContext();
		vctx.pushPath('name');
		vctx.popPath();
		vctx.pushPath('address');
		vctx.pushPath('street');
		vctx.popPath();
		vctx.pushPath('number');
		vctx.popPath();
		vctx.popPath();
		vctx.pushPath('pets');
		vctx.pushPath(0);
		vctx.pushPath('name');
		vctx.popPath();
		vctx.popPath();
		vctx.popPath();
		expect(vctx.result).toEqual({
			_validity: null,
			_children: {
				name: {
					_validity: null,
					_children: null
				},
				address: {
					_validity: null,
					_children: {
						street: {
							_validity: null,
							_children: null
						},
						number: {
							_validity: null,
							_children: null
						}
					}
				},
				pets: {
					_validity: null,
					_children: [
						{
							_validity: null,
							_children: {
								name: {
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
