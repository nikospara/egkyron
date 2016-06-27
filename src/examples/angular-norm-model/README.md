Normalized model example (in Angular)
=====================================

This is a variation of the [Angular example](../angular/README.md) where the model is normalized and kept in a global store.
This would be common in applications using Redux.

To make things clear, here is a denormalized model, as would be used by the Angular example:

```javascript
{
	"key": "123",
	"name": "Bob",
	"pets": [
		{
			"key": "456",
			"name": "Gary",
			"type": "Snail"
		}
	]
}
```

And here it is normalized, as kept in the `data` property of the store:

```
store.data = {
	"Owner": {
		"123": {
			"key": "123",
			"name": "Bob",
			"pets": [
				"456"
			]
		}
	},
	"Pet": {
		"456": {
			"key": "456",
			"name": "Gary",
			"type": "Snail"
		}
	}
}
```

The related objects are not referenced directly.
Instead, the container objects holds the `key` of the referenced object and the application uses that key to look the actual object up in the map corresponding to its type.

### Running

The example is encapsulated in a Gulp script. Egkyron must have been built before running this example. Run `npm install` and `bower install` and then run `gulp` (running `gulp` also starts the server).

Open http://localhost:4000/index-norm.html

The fields with constraints are the name of the pet owner (length 2 to 20, no spaces) and the name of the pet (length 3 to 10, no spaces).

Modifications relative to the Angular example
---------------------------------------------

- The `AngularIntrospector-norm`: It is based on the `AngularIntrospector-ext` (i.e. validation rules defined externally from the model - see `shared/makeRules.js`). It overrides the `evaluate(model, propName, type, vctx)` method to search in the store for objects referenced by key:

	```javascript
	var superEvaluate = AngularIntrospector.prototype.evaluate;
	AngularIntrospector.prototype.evaluate = function(model, propName, type, vctx) {
		var
			value = superEvaluate.call(this, model, propName, type, vctx),
			propType = this.findType(vctx, type, propName);

		// if the rules contain a definition of propType, then it should be an object;
		// if it is only a string, then consider it a key to the appropriate `store.data` mapping
		if( typeof value === 'string' && propType && store.data[propType] ) {
			value = store.data[propType][value];
		}

		return value;
	};
	```

- The editors in collections use the store to map the key to the object they are editing (see `ownerEditor.tpl.html` and `petEditor.tpl.html`) E.g. `<pet-editor ng-model="ctrl.pets[item]" ... >` in `ownerEditor.tpl.html`.
- The controller of the parent directive needs to expose any `store.data` needed by the view. E.g. the `ctrl.pets` property above is defined in `ownerEditor.js` as:

	```javascript
	Object.defineProperty(this, 'pets', {
		get: function() {
			return store.data['Pet'] || EMPTY_MAP;
		}
	});
	```

- Entities need to have an id, thus added the `key` property, assigning a UUID to it upon object creation.
- `store.js` handles the normalization/denormalization as well as storing the data.
