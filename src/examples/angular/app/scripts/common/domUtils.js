angular.module('common').factory('domUtils', function() {
	
	/**
	 * Return all child elements of {@code elem} having the specified tag name.
	 * The tag name and the {@code tagName} property of the element will be
	 * capitalized first, then compared.
	 */
	function childrenWithTagName(elem, tagName) {
		var i, result = [], children = elem.children, capTagName = tagName.toUpperCase();
		for( i=0; i < children.length; i++ ) {
			if( children[i].tagName.toUpperCase() == capTagName ) {
				result.push(children[i]);
			}
		}
		return result;
	}
	
	return {
		childrenWithTagName: childrenWithTagName
	};
});
