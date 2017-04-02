app.controller('homeController', function($scope,$http) {
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