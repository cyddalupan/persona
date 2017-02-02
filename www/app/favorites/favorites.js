app.controller('favoritesController', function($scope,$http,$cookies,$location) {

	//checklogin
	if(angular.isUndefined($cookies.get("user_id"))){
		$location.url('login');
	}

	/**
	 * Get Users Favorite Products
	 */
	$scope.get_my_favorites = function(){
		if($scope.user_id !== 0){
			$http({
				method: 'POST',
				url: $scope.s_url+'get_my_favorites/'+$scope.user_id
			}).then(function successCallback(response) {
				$scope.my_favorites = response.data;
			}, function errorCallback(response) {
				console.log(response);
				alert("Please check connection and try again.");
			});
		}
	}
	//run get_my_favorites
	$scope.get_my_favorites();
});