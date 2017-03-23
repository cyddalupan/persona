app.controller('notificationController', function($scope,$cookies,$http) {

	$scope.notifications = [];

	$http({
		method: 'POST',
		url: $scope.s_url+'notification_list/'+$cookies.get("user_id"),
		data:{
			'user_id'	: $cookies.get("user_id"),
			'token'		: $cookies.get("token")
		}
	}).then(function successCallback(response) {
		$scope.notifications = response.data;
	}, function errorCallback(response) {
		console.log(response);
	});

});