app.controller('includeSearchController', function($scope,$http,$location) {
	

	$scope.redirect = function(searchbox){
		$location.url('/search/'+searchbox+'/0/0/0/0');
	}
});