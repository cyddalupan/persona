app.controller('registerController', function($scope,$http,$location) {
	/**
	 * Submit Registration form
	 * to create new user
	 */
	$scope.registrationForm = function(valid){
		if($scope.formData.inputPassword != $scope.formData.inputCpassword){
			valid = 0;
			alert('Password dont match')
		}

		if (valid) {
			console.log($scope.formData);
			$http({
			method: 'POST',
			url: $scope.s_url+'register',
			data: {
				'formdata' : $scope.formData
			}
			}).then(function successCallback(response) {
				if(response.data == "added"){
					alert('Registration Success!');
					$location.url('login');
				}else{
					alert(response.data);
				}
			}, function errorCallback(response) {
				console.log(response);
				alert("Please check connection and try again.");
			});
		}
		 else {
			console.log('invalid')
		}
	};
});