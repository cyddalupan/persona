app.controller('my_adsController', function($scope,$http,$cookies,$location) {
	
	$scope.all_my_ads = '';

	//checklogin
	if(angular.isUndefined($cookies.get("user_id"))){
		$location.url('login');
	}

	/**
	 * Get Add Ads created by logged User
	 */
	$scope.getMyAds = function(){
		$http({
			method: 'GET',
			url: $scope.s_url+'my-ads/'+$cookies.get("user_id")
		}).then(function successCallback(response) {
			$scope.all_my_ads = response.data;
		}, function errorCallback(response) {
			console.log(response);
		});
	}
	$scope.getMyAds();


	$scope.showBlankRibbon = function(ask_featured){
		if(ask_featured == 1){
			return false;
		}else{
			return true;
		}
	}
	
	$scope.showFullRibbon = function(ask_featured){
		if(ask_featured == 1){
			return true;
		}else{
			return false;
		}
	}

    /**
	 * Send request to admin for 
	 * making this ad a featured ad
	 */
    $scope.ask_featured_ad = function(ad_id,index){
     	$scope.all_my_ads[index].ask_featured = 1;

    	$http({
			method: 'POST',
			url: $scope.s_url+'ask_featured_ad/'+ad_id
		}).then(function successCallback(response) {
			
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

    /**
	 * remove request to admin for 
	 * making this ad a featured ad
	 */
    $scope.un_ask_featured_ad = function(ad_id,index){
    	$scope.all_my_ads[index].ask_featured = 0;

    	$http({
			method: 'POST',
			url: $scope.s_url+'un_ask_featured_ad/'+ad_id
		}).then(function successCallback(response) {
			
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

	/**
	 * Delete the Ad you poster
	 * send confirmation before delete
	 */
	$scope.delete_ad = function(ads_id){
		if(!confirm('Are you sure you want to Delete?'))
		{
			return false;
		}
		else
		{
			$http({
			method: 'POST',
			url: $scope.s_url+'delete_ad/'+ads_id,
			data:{
				'user_id'	: $cookies.get("user_id"),
				'token'		: $cookies.get("token")
			}
			}).then(function successCallback(response) {
				if(response.data == 'logout'){
					alert("Session Expired Please Login Again.")
					$scope.logout();
				}

				$scope.getMyAds();
			}, function errorCallback(response) {
				console.log(response);
				alert("Please check connection and try again.");
			});
		}
	}

    /**
	 * Submit Password form
	 * change user password
	 * And submit to logout
	 */
    $scope.changePasswordSubmit = function(){

    	if(this.newPassword == this.confirmNewPassword)
    	{
    		$scope.change_password_button = 1;
	    	$http({
				method: 'POST',
				url: $scope.s_url+'change_password',
				data: {'user_id':$cookies.get("user_id"),'oldPassword':this.oldPassword,'newPassword':this.newPassword}
			}).then(function successCallback(response) {
				if(response.data == 1){
					$('#changePassword').modal('hide');
					$scope.logout();
				}else{
					alert(response.data);
	    			$scope.change_password_button = 0;
				}
			}, function errorCallback(response) {
				console.log(response);
				alert("Please check connection and try again.");
			});
    	}
    	else
    	{
    		alert("New password and confirm password did not match.")
    	}
    }
});