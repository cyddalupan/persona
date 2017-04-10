app.controller('mainController', function($scope,$cookies,$location,$timeout,$http) {
	
	//check if local host to know what api to connect
	if (location.hostname === "localhost" || location.hostname === "127.0.0.1"){
		$scope.s_url = 'http://localhost/persona_api/public/';
	}else{
		$scope.s_url = 'http://web.haynaku.shop/haynaku_api/public/';
	}

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
	if(device === true){
		$scope.mobile_page_show = 0;
	}
	/**
	* Nav toggler
	*/
	$scope.isActive = false;
  $scope.activeButton = function() {
    $scope.isActive = !$scope.isActive;
  }
	/**
	* Remove Active Nav Button
	*/
	$scope.CloseNav = function(){
        $("#mySidenav").removeClass('activenav');
				$(".navbar-toggle").removeClass('activeNavbtn');
  }
	/**
	* Active footer mobile
	*/
	$(function(){
   $('#footer-mobile a').click(function(){
        $('#footer-mobile .active').removeClass('active'); // remove the class from the currently selected
        $(this).addClass('active'); // add the class to the newly clicked link
    });
	});
	/**
	* Active footer
	*/
	$(function(){
   $('#footer a').click(function(){
        $('#footer .active').removeClass('active'); // remove the class from the currently selected
        $(this).addClass('active'); // add the class to the newly clicked link
    });
	});
		/**
	 * Gets The categories And Show It in the Homepage
	 */
	$scope.get_category = function()
	{
		if(angular.isUndefined($scope.allCategories))
		{
			$http({
				method: 'GET',
				url: $scope.s_url+'all-category'
			}).then(function successCallback(response) {
				optionCategory = [];
				angular.forEach(response.data, function(value, key) {
					optionCategorydata = [];
					optionCategorydata['id'] = parseInt(value.id);
					optionCategorydata['name'] = value.name;
					optionCategorydata['photo'] = value.photo;
					optionCategory.push(optionCategorydata);
				});
				$scope.allCategories = optionCategory;
			}, function errorCallback(response) {
				console.log(response);
			});
		}
	}
	//get category
	$scope.get_category();
});