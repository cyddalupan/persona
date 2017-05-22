app.controller('subCategoryController', function($scope,$http,$routeParams,$timeout,$cookies) {
	
	$scope.category_id = $routeParams.category_id;
	$scope.category_name = $routeParams.category_name;
	$scope.pagerloader = 1;
	$scope.usersFavoriteProducts = [];
	$scope.ShowbannerEvery = 12;
	$scope.BigBanners = [];

	/**
	 * changing ads type,
	 * only show ads thats on the selected ads type.
	 * used_at inside category and search
	 */
    $scope.click_ads_type = function(ads_type_id,used_at){
    	$scope.ads_type_id = ads_type_id;

    	if(used_at == 'inside_category')
    	{
    	  	$scope.selectSubCat($scope.currentCategoryId);
    	}
    	if(used_at == 'search')
    	{
			$scope.search_product($scope.searchbox,$scope.currentCategoryId,$scope.location_id,$scope.sub_category_id);
    	}
    }

    /**
	 * to check if ads type is active
	 */
    $scope.click_ads_type_active = function(ads_type_id){
    	if(ads_type_id == $scope.ads_type_id){
    		return "active";
    	}
    }

    /**
	 * Updates the ads type on edit ads page (new_ad)
	 *
	 * when ads is edited, it waits for the loading of ads
	 * then wait for category_id to load.
	 * then wait for the ads_types to be updated
	 * then select what ads in database
	 */
	$scope.$watch('ads_types', function(newVal, oldVal){
		if(!angular.isUndefined($scope.adsSingle))
		{
			$scope.ads_type = parseInt($scope.adsSingle.ads_type_id);	
		}
	});

	/**
	 * Selected Sub category on sidebar,
	 * to select if the button is selected
	 */
    $scope.selec_sidebar_sub_category = function(subcategory_id){
    	$scope.selected_sidebar_sub_category = subcategory_id;

    	$scope.selectSubCat($scope.currentCategoryId);
    }

    /**
	 * Selected Sub category on sidebar,
	 * to show if the button is selected
	 */
    $scope.selec_sidebar_sub_category_is_active = function(subcategory_id){
    	if(subcategory_id == $scope.selected_sidebar_sub_category)
    	{
    		return 'active';
    	}
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
	 * if Category is selected
	 * load a sub category
	 */
	$scope.selectSubCat = function(category_id){
		$scope.currentCategoryId = category_id;
		$scope.pagerloader = 1;
		$scope.pager = 1;
		$scope.pager_no_result = 0;
		$scope.no_ads_result = 0;
		$scope.allAds = "";
		if(angular.isUndefined($scope.ads_type_id)){
			$scope.ads_type_id = 0;
		}

		if(angular.isUndefined($scope.selected_sidebar_sub_category)){
			$scope.selected_sidebar_sub_category = 0;
		}

		$http({
			method: 'GET',
			url: $scope.s_url+'get-ads/'+category_id+'/'+$scope.ads_type_id+'/'+$scope.selected_sidebar_sub_category
		}).then(function successCallback(response) {
			if (response.data.data.length == 0) {
				$scope.no_ads_result = 1;
			};
			$scope.allAds = response.data.data;
			$scope.pagerloader = 0;
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	/**
	 * If the ad should show a banner of not
	 */
    $scope.bigbannershow = function(indexcount){
    	if (indexcount % $scope.ShowbannerEvery === 0) {
    		return 1;
    	}else{
    		return 0;
    	}
    }


    /**
	 * Get One Random Banner
	 */
    $scope.get_random_banner = function(indexcount){
    	if($scope.is_search === 0){
    		$timeout(function () {
				if (indexcount % $scope.ShowbannerEvery === 0) {
		    		$http({
					method: 'GET',
					url: $scope.s_url+'get_big_banner'
					}).then(function successCallback(response) {
						$scope.BigBanners[indexcount] = response.data;
					}, function errorCallback(response) {
						console.log(response);
					});
		    	}
		    });
	    }
    }


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
	 * This is Used with edit ad page.
	 * when user chose what ad to edit,
	 * and adsSingle watch will update the input.
	 * but the sub_category option will not be updated because
	 * we dont know what the category is. so we load the category first
	 * then the category will update sub_categories. and this function will listen to that.
	 * and when the set of sub_categories is selected, 
	 * we chose what the sub_category the user selected.
	 */
	$scope.$watch('sub_categories', function(newVal, oldVal){
		if(!angular.isUndefined($scope.adsSingle))
		{
			$scope.subcategory = parseInt($scope.adsSingle.sub_category_id);	
		}
	});

	//On Load
	if($scope.category_id !== ""){
		$scope.is_search = 0;
		$scope.selectSubCat($scope.category_id);
	}else{
		$scope.is_search = 1;
	}

	$scope.get_sub_category($scope.category_id);
	
	$( ".footer-subcategory" ).click(function() {
  	$(".subcategory-class").toggleClass( "fadein" );
	});
	$('.subcategory-class').on('click', function(){
    $(".subcategory-class").removeClass('fadein');
	});
});

