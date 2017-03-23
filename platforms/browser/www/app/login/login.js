app.controller('loginController', function($scope,$http,$cookies,$location) {

	if(!angular.isUndefined($cookies.get("user_id")))
	{
		$location.url('my_ads');
	}

	/**
	 * User Loged in with username and password
	 * checks if the account is valid
	 */
	$scope.loginSubmit = function(){
		$http({
			method: 'POST',
			url: $scope.s_url+'login',
			data: {
				'username' : this.username,
				'password' : this.password
			}
		}).then(function successCallback(response) {
			//Do not remove. this is the error login message
			alert(response.data.message);
			if(response.data.user_id != 0){
				$cookies.put("user_id", response.data.user_id);
				$cookies.put("token", response.data.token);
				$scope.user_id = response.data.user_id;
				$scope.welcome_user = response.data.message;
				$scope.hash = response.data.hash;
				location.reload();
			}
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

	/**
	 * Submit forgot password form
	 * send to api to send email to user
	 */
    $scope.forgotPasswordSubmit = function(){
    	$scope.forgot_password_button = 1;
    	$http({
			method: 'POST',
			url: $scope.s_url+'forgot_password',
			data: {'email':this.email}
		}).then(function successCallback(response) {
			if(response.data == 1){
				alert("The password has been sent to your email.");
				$('#forgotPasswordModal').modal('hide');
			}else{
				alert(response.data);
    			$scope.forgot_password_button = 0;
			}
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

});