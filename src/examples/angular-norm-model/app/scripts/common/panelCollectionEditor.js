angular.module('common').directive('panelCollectionEditor', ['$compile', '$parse', 'domUtils', function($compile, $parse, domUtils) {
	return {
		restrict: 'E',
		scope: true,
		require: ['ngModel', '?validate'],
		compile: function(tElem) {
			var header, editor;

			header = domUtils.childrenWithTagName(tElem[0], 'header');
			if( header && header.length ) {
				tElem[0].removeChild(header[0]);
				header = header[0].innerHTML;
			}
			else {
				header = '';
			}
			
			editor = tElem.html();
			
			tElem.empty();
			
			return {
				pre: function(scope, elem, attrs, ctrls) {
					var validateCtrl = ctrls[1];
					if( validateCtrl && angular.isFunction(validateCtrl.skipIndex) ) {
						validateCtrl.skipIndex();
					}
				},
				post: function(scope, elem, attrs, ctrls) {
					var ngModel = ctrls[0], defaultIsEmpty = ngModel.$isEmpty, unwatchViewValue, varName = attrs.varName || 'item', addItem, removeItem;

					addItem = $parse(attrs.addItem);
					scope.addItem = function(o) {
						// XXX This assumes that the parameter of addItem() is always called index
						var prevIndex = scope.index;
						scope.index = o.index;
						try {
							return addItem(scope);
						}
						finally {
							scope.index = prevIndex;
						}
					};

					removeItem = $parse(attrs.removeItem);
					scope.removeItem = function(o) {
						// XXX This assumes that the parameter of removeItem() is always called item (do not confuse this with the varName)
						var prevItem = scope.item;
						scope.item = o.item;
						try {
							return removeItem(scope);
						}
						finally {
							scope.item = prevItem;
						}
					};

					ngModel.$render = function() {
						if( unwatchViewValue ) {
							unwatchViewValue();
							unwatchViewValue = null;
						}
						if( angular.isArray(ngModel.$viewValue) ) {
							scope.collection = ngModel.$viewValue.slice();
							unwatchViewValue = scope.$watchCollection(function() { return ngModel.$viewValue; }, viewValueChanged);
						}
						else {
							scope.collection = [];
						}
					};
					
					ngModel.$isEmpty = function(value) {
						return angular.isArray(value) ? value.length === 0 : defaultIsEmpty.call(ngModel,value);
					};
					
					function viewValueChanged(newval, oldval) {
						if( newval !== oldval ) {
							ngModel.$render();
							ngModel.$validate();
						}
					}
					
					elem.append($compile(
						'<div style="position:relative">' +
							header + '<button ng-click="addItem({index:0})" style="position:absolute;top:2px;right:0;display:inline-block;float:right" type="button" class="btn btn-primary btn-xs">+</button>' +
							'<div style="clear:both">' +
						'</div>' +
						'<div>' +
							'<div class="panel panel-default" ng-repeat="' + varName + ' in collection"><div class="panel-body">' +
								editor +
							'</div></div>' +
						'</div>'
					)(scope));
				}
			};
		}
	};
}]);
