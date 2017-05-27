app.controller('favoritesController', function($scope,$http,$cookies,$location) {
	//checklogin
	if(angular.isUndefined($cookies.get("user_id"))){
		$location.url('login');
	}

	/**
	 * Remove Favorites
	 * Remove Id to array of Favorites
	 */
	$scope.RemoveFavorites = function(product_id){
		if(!confirm('Are you sure you want to Remove Favorite?')){
			return false;
		}
		$http({
			method: 'POST',
			url: $scope.s_url+'remove-favorites/'+product_id+'/'+$cookies.get("user_id"),
			data:{
				'user_id'	: $cookies.get("user_id"),
				'token'		: $cookies.get("token")
			}
		}).then(function successCallback(response) {
			if(response.data == 'logout'){
				alert("Session Expired Please Login Again.")
				$scope.logout();
			}

			location.reload();
		}, function errorCallback(response) {
			console.log(response);
		});
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
			});
		}
	}
	//run get_my_favorites
	$scope.get_my_favorites();
});