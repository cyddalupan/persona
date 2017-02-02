app.controller('mainController', function($scope,$cookies,$location,$timeout,$http) {
	$scope.s_url = api_url;

	$scope.mobile_page_show = 1;
	$scope.notification_count = 0

	//checklogin
	if(!angular.isUndefined($cookies.get("user_id"))){
		$scope.user_id = $cookies.get("user_id");
	}


	/**
	 * Logout User
	 * Removes id to cookies
	 */
	$scope.logout = function(){
		$cookies.remove("user_id");
		$scope.user_id = 0;
		$cookies.remove("unfinishedAdId");
		$cookies.remove("token");
		$scope.unfinishedAdId = 0;
		$location.url('login');
		$timeout(function () {
			location.reload();
        },1000);
	}

	$scope.CloseNav = function(){
        $(".navbar-collapse").stop().css({ 'height': '1px' }).removeClass('in').addClass("collapse");
        $(".navbar-toggle").stop().removeClass('collapsed');
    }

	/**
	 * get notification count
	 */
	$scope.get_notification_count = function(){
		$http({
			method: 'POST',
			url: $scope.s_url+'notification_count/'+$cookies.get("user_id"),
			data:{
				'user_id'	: $cookies.get("user_id"),
				'token'		: $cookies.get("token")
			}
		}).then(function successCallback(response) {
			$scope.notification_count = response.data;
		}, function errorCallback(response) {
			console.log(response);
		});
		//count notification again in 3min
		$timeout(function () {
			$scope.get_notification_count();
        },180000);
	}
	//get notification count
	if(!angular.isUndefined($cookies.get("user_id"))){
		$scope.get_notification_count();
	}

	/**
	 * Show Mobile page on web only
	 */
	device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
	if(device == true){
		$scope.mobile_page_show = 0;
	}
});