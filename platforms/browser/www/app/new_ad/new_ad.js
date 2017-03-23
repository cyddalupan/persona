app.controller('new_adController', function($scope,$http,$location,$routeParams,$cookies,Upload,$timeout,$anchorScroll) {

	$scope.galleries = '';
	$scope.featured_gallery = 0;
	$scope.unfinishedAdId = $routeParams.ad_id;

	/**
	 * Pass Ads Id And
	 * get Single ads data
	 * AKA product
	 */
	$scope.selectAds = function(ads_id){
		$scope.adsSingle = "";
		$scope.galleries = "";
		$scope.zoom_img_path = "";
		$http({
			method: 'GET',
			url: $scope.s_url+'get-ads-single/'+ads_id
		}).then(function successCallback(response) {
			$scope.adsSingle = response.data;

			$scope.unfinishedAdId = ads_id;

			$scope.get_locations();

		}, function errorCallback(response) {
			// console.log(response);
			// alert("Please check connection and try again.");
		});
	}

	/**
	 * If its a new ad or editing an old ad
	 * this method will save it
	 */
	$scope.update_ad = function(){
		$http({
		method: 'POST',
		url: $scope.s_url+'store_ad/'+$scope.unfinishedAdId,
		data: {
			'user_id'		: $cookies.get("user_id"),
			'token'			: $cookies.get("token"),
			'title' 		: this.title,
			'location' 		: this.location,
			'category' 		: this.category,
			'subcategory' 	: this.subcategory,
			'ads_type' 		: this.ads_type,
			'price' 		: this.price,
			'description' 	: this.description
		}
		}).then(function successCallback(response) {

			//check login
			if(response.data == 'logout'){
				alert("Session Expired Please Login Again.")
				$scope.logout();
			}

			if(response.data.result == "failed"){
				$scope.errors = response.data.errors;
				//move to errors
				$location.hash('errors');
				$anchorScroll();
			}else if(response.data.result == "success"){
				$scope.unfinishedAdId = 0;
				$cookies.remove("unfinishedAdId");
				$location.url('my_ads');
			}
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

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
				alert("Please check connection and try again.");
			});
		}
	}

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
			alert("Please check connection and try again.");
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
			alert("Please check connection and try again.");
		});
	}

	/**
	 * This is a Multiple file uploader
	 * this loops all the file the user has been upload
	 * and the gallery will be belong to the current ad ad_id
	 * that is currently being edited.
	 */
	$scope.uploadFiles = function(files, errFiles) {
        $scope.files = files;
        $scope.errFiles = errFiles;
        angular.forEach(files, function(file) {
            file.upload = Upload.upload({
                url: $scope.s_url+'upload_ad_gallery/'+$scope.unfinishedAdId,
                data: {
					'user_id'	: $cookies.get("user_id"),
					'token'		: $cookies.get("token"),
					'file'		: file
				}
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
					if(response.data.result == "failed"){
						$scope.errors = response.data.errors;
						//move to errors
						$location.hash('errors');
						$anchorScroll();
					}
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        });
        $timeout(function () {   
        	$scope.get_gallery($scope.unfinishedAdId);
        });
    }

	/**
	 * Get Gallery
	 * Create Default Zoom Image
	 */
	$scope.get_gallery = function(ad_id){
    	$http({
		method: 'POST',
		url: $scope.s_url+'get_gallery/'+ad_id
		}).then(function successCallback(response) {
			$scope.galleries = response.data;
			
			if(!angular.isUndefined($scope.galleries[0])){
				$scope.zoom_img_path = $scope.galleries[0].path;
			}
				
			if(angular.isUndefined($scope.featured_gallery) || $scope.featured_gallery == null){
				$scope.featured_gallery = $scope.galleries[0];
			}
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

    /**
	 * Soft Deleting image to the gallery
	 */
    $scope.remove_gallery = function(gallery_id){
    	$http({
		method: 'POST',
		url: $scope.s_url+'remove_gallery/'+gallery_id,
		data:{
			'user_id'	: $cookies.get("user_id"),
			'token'		: $cookies.get("token")
		}
		}).then(function successCallback(response) {
			if(response.data == 'logout'){
				alert("Session Expired Please Login Again.")
				$scope.logout();
			}
			$scope.get_gallery($scope.unfinishedAdId);
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

    /**
	 * Saving the Featured Image the user this.
	 * means every click the user do on the gallery will be saved
	 */
    $scope.set_featured_image = function(ad_id,gallery_id){
    	$http({
		method: 'POST',
		url: $scope.s_url+'set_featured_image/'+ad_id+"/"+gallery_id,
		data:{
			'user_id'	: $cookies.get("user_id"),
			'token'		: $cookies.get("token")
		}
		}).then(function successCallback(response) {
			if(response.data == 'logout'){
				alert("Session Expired Please Login Again.")
				$scope.logout();
			}
			$scope.get_gallery_single(gallery_id);
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

	/**
	 * Creating A blank Data ads table when user click create ad.
	 * so that there's a ads id when the gallery is save.
	 * this created ads data is not yes active.
	 * saving it will activate the ad data
	 */
	$scope.add_new_product = function(user_id){
		$http({
		method: 'POST',
		url: $scope.s_url+'new_blank_ad/'+$scope.user_id,
		data:{
			'user_id'	: $cookies.get("user_id"),
			'token'		: $cookies.get("token")
		}
		}).then(function successCallback(response) {
			if(response.data == 'logout'){
				alert("Session Expired Please Login Again.")
				$scope.logout();
			}
			//if return is not number return 0
			if(isNaN(response.data))
			{
				response.data = 0;
			}
			$cookies.put('unfinishedAdId',response.data);
			$scope.unfinishedAdId = response.data;
		
			$scope.selectAds($scope.unfinishedAdId);
			$scope.featured_gallery.path = '';
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

	if( !angular.isUndefined($routeParams.ad_id) )
	{
		$scope.selectAds($scope.unfinishedAdId);
	}
	else
	{
		$scope.selectAds($scope.unfinishedAdId);
	}
	$scope.get_locations();
	$scope.get_category();
	
	if($routeParams.ad_id == 0)
	{
		if($cookies.get('unfinishedAdId') == 0 || $cookies.get('unfinishedAdId') == undefined)
		{
			$scope.add_new_product($cookies.get("user_id"));
		}
		else
		{
			$scope.selectAds($cookies.get('unfinishedAdId'));
		}
	}else{
		$cookies.put('unfinishedAdId',$scope.unfinishedAdId);
		$scope.selectAds($scope.unfinishedAdId);
	}
	
	/**
	 * Listen when variable adsSingle change
	 * So the Input Variables will change
	 * When Editin or adding new ad
	 */
	$scope.$watch('adsSingle', function(newVal, oldVal){
		if(!angular.isUndefined(newVal) && newVal !== '' && newVal !== 0){
			$cookies.put('unfinishedAdId',newVal.id);
			$scope.title = newVal.title;
			$scope.location = parseInt(newVal.location_id);
			$scope.category = parseInt(newVal.category_id);
			$scope.get_sub_category(newVal.category_id);
			$scope.ads_type = newVal.ads_type;
			$scope.price = newVal.price;
			$scope.description = newVal.description;
			$scope.featured_gallery = newVal.featured_image;
			$scope.get_gallery(newVal.id);
			$scope.files = files = "";
			$scope.errFiles = errFiles = "";
			if (!$scope.$$phase) {
				$scope.$apply();
			}
		}
		else if(angular.isUndefined(newVal) ){
			$scope.title = "";
			$scope.category = 0;
			$scope.subcategory = 0;
			$scope.price = "";
			$scope.description = "";
			$scope.featured_gallery = "";
			$scope.files = files = "";
       		$scope.errFiles = errFiles = "";
		}
	});

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

});