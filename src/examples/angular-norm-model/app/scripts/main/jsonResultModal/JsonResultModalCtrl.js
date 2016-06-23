angular.module('app').controller('JsonResultModalCtrl', ['title', 'json', function(title, json) {
	this.title = title;
	this.json = json;
}]);
