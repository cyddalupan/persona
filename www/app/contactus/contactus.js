app.controller('contactusController', function($scope,$http) {
	$scope.is_contact_us_submited = 0;

	/**
	 * Submit the contact Us form and save to DB
	 */
	$scope.submit_contact = function(valid){
		if (valid) {
			$http({
				method: 'POST',
				url: $scope.s_url+'contact-us-send',
				data: {
					'fullname'		: this.fullname,
					'subject'		: this.subject,
					'email'			: this.email,
					'phonenumber'	: this.phonenumber,
					'message'		: this.message
				}
			}).then(function successCallback(response) {
				console.log(response);
				$scope.is_contact_us_submited = 1;
			}, function errorCallback(response) {
				console.log(response);
			});
		}else {
			console.log('invalid form');
		}
	}
});