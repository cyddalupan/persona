app.controller('searchController', function($scope,$http,$routeParams,$location) {
	
	/**
	 * User to get list of locations,
	 * originally used for searching ads
	 * with location
	 */
	$scope.get_locations = function(){
		if(angular.isUndefined($scope.locations)){	
			$http({
				method: 'GET',
				url: $scope.s_url+'get_locations'
			}).then(function successCallback(response) {
				optionLocation = [];
				
				optionLocationdata = [];
				optionLocationdata['id'] = 0;
				optionLocationdata['name'] = "Location:";
				optionLocation.push(optionLocationdata);
				
				angular.forEach(response.data, function(value, key) {
					optionLocationdata = [];
					optionLocationdata['id'] = parseInt(value.id);
					optionLocationdata['name'] = value.name;
					optionLocation.push(optionLocationdata);
				});
				
				$scope.locations = optionLocation;
				$scope.get_category();
			}, function errorCallback(response) {
				console.log(response);
				
			});
		}
	}
	

	/**
	 * Search the ads with words in the @param seachbox
	 * And By optional variable @param category_id 
	 */
	$scope.search_product = function(searchbox,category_id,location_id,sub_category_id,sort_search){

		if(angular.isUndefined(location_id))
		{
			this.location_id = 0;
		}else{
			this.location_id = location_id;
		}

		if(angular.isUndefined(category_id))
		{
			this.category_id = 0;
		}else{
			this.category_id = category_id;
		}

		if(angular.isUndefined(sub_category_id))
		{
			sub_category_id = 0;
		}

		if(angular.isUndefined(sort_search))
		{
			$scope.sort_search = 0;
		}else{
			$scope.sort_search = sort_search;
		}


		if(angular.isUndefined($scope.ads_type_id))
		{
			$scope.ads_type_id = 0;
		}

		$scope.searchbox = searchbox;
		if(searchbox == 0){
		$scope.searchbox = "";
		}
		$scope.currentCategoryId = this.category_id;
		$scope.location_id = this.location_id;
		$scope.no_ads_result = 0;
		$scope.pagerloader = 1;
		$scope.allAds = "";
		$http({
			method: 'GET',
			url: $scope.s_url+'search-ads/'+searchbox+'/'+this.category_id+'/'+this.location_id+'/'+sub_category_id+'/'+$scope.ads_type_id+'/'+$scope.sort_search
		}).then(function successCallback(response) {
			if (response.data.length == 0) {
				$scope.no_ads_result = 1;
			};

			$scope.allAds = response.data;
			$scope.pagerloader = 0;
			$scope.get_locations();
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	/**
	 * When user select a category on dropdown
	 * a list of sub category will be automatically listed
	 */
	$scope.get_sub_category = function(category){

		//get ads type
		if(!angular.isUndefined(category) && category != 0)
		{
			$scope.get_ads_type(category);
		}

		$scope.sub_categories = null;
		$http({
		method: 'POST',
		url: $scope.s_url+'get_sub_category/'+category
		}).then(function successCallback(response) {
			optionSubCategory = [];
			
			optionSubCategorydata = [];
			optionSubCategorydata['id'] = 0;
			optionSubCategorydata['name'] = "Subcategory:";
			optionSubCategory.push(optionSubCategorydata);

			angular.forEach(response.data, function(value, key) {
				optionSubCategorydata = [];
				optionSubCategorydata['id'] = parseInt(value.id);
				optionSubCategorydata['name'] = value.name;
				optionSubCategorydata['icon'] = value.icon;
				optionSubCategory.push(optionSubCategorydata);
			});
			$scope.sub_categories = optionSubCategory;
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	/**
	 * Get AdsType, 
	 * AdsType example: 
	 * for sale, for rent, sharing
	 */
	$scope.get_ads_type = function(category_id)
	{
		$http({
			method: 'GET',
			url: $scope.s_url+'get_ads_type/'+category_id
		}).then(function successCallback(response) {

			optionAdsTypes = [];
			angular.forEach(response.data, function(value, key) {
				optionAdsTypesdata = [];
				optionAdsTypesdata['id'] = parseInt(value.id);
				optionAdsTypesdata['type'] = value.type;
				optionAdsTypes.push(optionAdsTypesdata);
			});
			$scope.ads_types = optionAdsTypes;
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	$scope.search_category_submit = function(){
		$scope.get_sub_category(this.search_category);
	}

	$scope.showFullRibbon = function(ask_featured){
		if(ask_featured == 1){
			return true;
		}else{
			return false;
		}
	}

	/**
	 * Add Ads to favorites
	 * Ads adsId to arrays of favorites
	 */
	$scope.addFavorites = function(product_id){
		$http({
			method: 'POST',
			url: $scope.s_url+'add-favorites/'+product_id+'/'+$scope.user_id,
			data:{
				'user_id'	: $cookies.get("user_id"),
				'token'		: $cookies.get("token")
			}
		}).then(function successCallback(response) {
			if(response.data == 'logout'){
				alert("Session Expired Please Login Again.")
				$scope.logout();
			}
			if(response.data == 'success')
			{
				$scope.usersFavoriteProducts.push(product_id);
			}
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	/**
	 * Check If Favorites Button Should be shown
	 */
	$scope.IfShowFavoriteBot = function(product_id){
		if(
			$scope.user_id != 0 &&
			$.inArray(product_id,$scope.usersFavoriteProducts) < 0
		){
			return 1;
		}else{
			return 0;
		}
	}

	/**
	 * Remove Favorites
	 * Remove Id to array of Favorites
	 */
	$scope.RemoveFavorites = function(product_id){
		$http({
			method: 'POST',
			url: $scope.s_url+'remove-favorites/'+product_id+'/'+$scope.user_id,
			data:{
				'user_id'	: $cookies.get("user_id"),
				'token'		: $cookies.get("token")
			}
		}).then(function successCallback(response) {
			if(response.data == 'logout'){
				alert("Session Expired Please Login Again.")
				$scope.logout();
			}
			var index = $scope.usersFavoriteProducts.indexOf(product_id);
			if (index > -1) {
			    $scope.usersFavoriteProducts.splice(index, 1);
			}
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	/**
	 * Check If UnFavorites Button Should be shown
	 */
	$scope.IfShowUnFavoriteBot = function(product_id){
		if(
			$scope.user_id != 0 &&
			$.inArray(product_id,$scope.usersFavoriteProducts) >= 0
		){
			return 1;
		}else{
			return 0;
		}
	}

	/**
	 * Advance search
	 */
	$scope.advance_search = function(searchbox,search_category,search_location,search_sub_category,search_order){
		if(searchbox == ""){
			searchbox = "a";
			}
			$location.url('/search/'+searchbox+'/'+search_category+'/'+search_location+'/'+search_sub_category+'/'+search_order);
			
	}

	/**
	 * Gets The categories And Show It in the Homepage
	 */
	$scope.get_category = function()
	{
			$http({
				method: 'GET',
				url: $scope.s_url+'all-category'
			}).then(function successCallback(response) {
				optionCategory = [];
				
				optionCategorydata = [];
				optionCategorydata['id'] = 0;
				optionCategorydata['name'] = "Category:";
				optionCategory.push(optionCategorydata);
				
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


	$scope.sub_categories = null;
    $scope.pagerloader = 1;
	//get from url
    $scope.searchbox 			= $routeParams.searchbox;
    $scope.search_category 		= parseInt($routeParams.category_id);
    if(!angular.isUndefined($scope.search_category))
    {
    	$scope.search_category_submit();
    }

    $scope.search_location 		= parseInt($routeParams.location_id);
    $scope.search_sub_category 	= parseInt($routeParams.sub_category_id);
    $scope.search_order 		= $routeParams.search_order;



	//get category on load
	$scope.get_category();

	//get search variables and show result
	$scope.search_product($scope.searchbox,$scope.search_category,$scope.search_location,$scope.search_sub_category,$scope.search_order);
	
});