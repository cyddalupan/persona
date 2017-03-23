app.controller('adsSingleController', function($scope,$http,$routeParams,$cookies) {
	
	$scope.galleries = '';
	$scope.Comments = [];

	//checklogin
	if(!angular.isUndefined($cookies.get("user_id"))){
		$scope.user_id = $cookies.get("user_id");
	}

	/**
	 * Pass Ads Id And
	 * get Single ads data
	 * AKA product
	 */
	$scope.selectAds = function(ads_id){
		$scope.adsSingle = "";
		$scope.galleries = "";
		$scope.zoom_img_path = "";
		$http({
			method: 'GET',
			url: $scope.s_url+'get-ads-single/'+ads_id
		}).then(function successCallback(response) {
			$scope.adsSingle = response.data;

			$scope.updateComment(ads_id);

		}, function errorCallback(response) {
			// console.log(response);
			// alert("Please check connection and try again.");
		});
	}

	/**
	 * Get Gallery
	 * Create Default Zoom Image
	 */
	$scope.get_gallery = function(ad_id){
    	$http({
		method: 'POST',
		url: $scope.s_url+'get_gallery/'+ad_id
		}).then(function successCallback(response) {
			$scope.galleries = response.data;
			
			if(!angular.isUndefined($scope.galleries[0])){
				$scope.zoom_img_path = $scope.galleries[0].path;
			}
				
			if(angular.isUndefined($scope.featured_gallery) || $scope.featured_gallery == null){
				$scope.featured_gallery = $scope.galleries[0];
			}
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

	/**
	 * In Single ad view, theres a thumbnail of small images
	 * and a Large Image. when user click the Small Image
	 * It shows on the Large image
	 */
	$scope.zoom_gallery = function(zoom_img_path){
		$scope.zoom_img_path = zoom_img_path;
	}


	/**
	 * Adding comment to a single ad
	 */
	$scope.post_comment = function(ads_id){
		$http({
		method: 'POST',
		url: $scope.s_url+'comment',
		data: {
			'ads_id' 	: ads_id,
			'user_id' 	: $scope.user_id,
			'comment' 	: this.comment,
			'user_id'	: $cookies.get("user_id"),
			'token'		: $cookies.get("token")
		}
		}).then(function successCallback(response) {
			if(response.data == 'logout'){
				alert("Session Expired Please Login Again.")
				$scope.logout();
			}
			$scope.updateComment(ads_id);
			
			//move to errors
			$("html, body").animate({ scrollTop: $(document).height()  }, 1000);

		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
		this.comment = "";
	}

	/**
	 * Update comment 
	 * on a single product
	 */
	$scope.updateComment = function(ads_id){
		$http({
			method: 'GET',
			url: $scope.s_url+'get_comments/'+ads_id
		}).then(function successCallback(response) {
			$scope.Comments = response.data;
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

	$scope.selectAds($routeParams.ad_id);
	$scope.get_gallery($routeParams.ad_id);
	$scope.updateComment($routeParams.ad_id);
});