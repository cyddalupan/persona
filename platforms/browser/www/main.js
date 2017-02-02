app.controller('mainController', function($scope) {
	$scope.s_url = api_url;

	$scope.mobile_page_show = 1;

	/**
	 * Show Mobile page on web only
	 */
	device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
	if(device == true){
		$scope.mobile_page_show = 0;
	}
});