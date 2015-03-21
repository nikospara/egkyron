angular.module('common').directive('panelCollectionEditor', ['$compile', 'domUtils', function($compile, domUtils) {
	return {
		restrict: 'E',
		scope: {
			addItem: '&',
			removeItem: '&'
		},
		require: ['ngModel'],
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
				post: function(scope, elem, attrs, ctrls) {
					var ngModel = ctrls[0], defaultIsEmpty = ngModel.$isEmpty, unwatchViewValue, varName = attrs.varName || 'item';

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
