var app = angular.module('myApp',['ngCookies','ngFileUpload','ngRoute']);

// configure our routes
app.config(function($routeProvider) {
	$routeProvider
		.when('/mobile', {
			templateUrl : 'pages/mobile-page.html',
			controller  : 'mobileController'
		});
});

/**
 * SiteController
 * All global javacript code
 * add here
 */

 app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

app.controller('SiteController', ['$scope','$http','$location','$cookies','$window', '$anchorScroll', 'Upload', '$timeout','$sce', function($scope,$http,$location,$cookies,$window,$anchorScroll,Upload,$timeout,$sce) {

	/*VARIABLES
	########################################################################
	########################################################################
	########################################################################
	*/
	$scope.s_url = 'http://cydd.website/haynaku_api/public/';
	$scope.usersFavoriteProducts = [];
	$scope.welcome_user = '';
	$scope.my_favorites = [];
	$scope.allAds = [];
	$scope.Comments = [];
	$scope.getCurrentProduct = '';
	$scope.galleries = '';
	$scope.zoom_img_path = '';
	$scope.no_ads_result = 0;
	$scope.pager = 1;
	$scope.currentCategoryId = 0;
	$scope.all_my_ads = '';
	$scope.is_contact_us_submited = 0;
	$scope.formData = {};
	$scope.featured_gallery = 0;
	$scope.hash = "";
	$scope.ShowbannerEvery = 12;
	$scope.BigBanners = [];
	$scope.splitroute = '';
	$scope.is_search = 0;
	$scope.ads_type_id = 0;
	$scope.selected_sidebar_sub_category = 0;

	/*AUTO LOADS
	########################################################################
	########################################################################
	########################################################################
	*/

	/**
	 * Check for Cookies
	 * if theres a ad that has being edited.
	 * and not yes finished. So the User Can continue
	 * even If the Page Refresh
	 */
	if(angular.isUndefined($cookies.get("unfinishedAdId"))){
		$scope.unfinishedAdId = "";
	}else{
		$scope.unfinishedAdId = $cookies.get("unfinishedAdId");
	}

	/**
	 * If The Settings is not Yet On the Cookie
	 * Get Settings from API, And Save to cookie
	 */
	if(angular.isUndefined($cookies.get("settings"))){
		console.log('Settings Added');
		$http({
			method: 'GET',
			url: $scope.s_url+'get-settings'
		}).then(function successCallback(response) {
			$cookies.putObject("settings",response.data);
			$scope.settings = $cookies.getObject("settings");
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}else{
		$scope.settings = $cookies.getObject("settings");
	}


	/**
	 * Check Cookies if user is loged in, If no cookie, means not log in.
	 * send Zero value to user_id, Than means not logged.
	 */
	if(angular.isUndefined($cookies.get("user_id"))){
		$scope.user_id = 0;
	}else{
		$scope.user_id = $cookies.get("user_id");
	}

	/**
	 * On Load, Gets The Url Variable.
	 * to find out what page should be shown.
	 * if no page is set on url, Direct to category page, it is the home page.
	 * If not, split the URL to page name, and id variable, if there is.
	 */
	if($location.path() === ''){
		$scope.activePage = 'category';
		$scope.splitroute = ['','category',''];
	}else{
		$scope.splitroute = $location.path().split("/");
		$scope.activePage = $scope.splitroute[1];
		$scope.activePageId = $scope.splitroute[2];
	}

	/**
	 * Test user login every * seconds
	 * to make sure the session on the server still exists
	 */
	$scope.testlogin = function(){
		$http({
			method: 'GET',
			url: $scope.s_url+'check_login'
		}).then(function successCallback(response) {
			if(response.data == 0)
			{
				$cookies.remove("user_id");
				$scope.user_id = 0;
				$cookies.remove("unfinishedAdId");
				$scope.unfinishedAdId = 0;

				if($scope.activePage == 'my_ads')
				{
					alert('Please Login');
					$scope.redirect('login');					
				}
			}
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});

		$timeout(function(){
			$scope.testlogin();
		},90000);
	}	
	$scope.testlogin();

	/*LISTENERS
	########################################################################
	########################################################################
	########################################################################
	*/

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

	/**
	 * when currentCategoryId is change,
	 * change the available ads type
	 */
	$scope.$watch('currentCategoryId', function(newVal, oldVal){
		if(newVal !== 0)
		{
			$scope.get_ads_type(newVal);	
		}
	});

	/*METHODS
	########################################################################
	########################################################################
	########################################################################
	*/

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
	 * change the activePage variable
	 * depends on the button clicked
	 */
	$scope.redirect = function(pageName,id){
		//if no value passed
   		id = typeof id !== 'undefined' ? id : "";

		$location.path(pageName+"/"+id);
		$scope.activePage = pageName;

		$scope.splitroute = $location.path().split("/");
	}

	/**
	 * used by ng-show
	 * to test if the page is active
	 * by testing if the var activePage
	 * is equal to page using this function
	 */
	$scope.imActive = function(imPageName){
		if(imPageName == $scope.activePage)
			return 1;
		else
			return 0;
	}

	/**
	 * Search the ads with words in the @param seachbox
	 * And By optional variable @param category_id 
	 */
	$scope.search_product = function(searchbox,category_id,location_id,sub_category_id){

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

		if(angular.isUndefined($scope.sort_search))
		{
			$scope.sort_search = 0;
		}


		if(angular.isUndefined($scope.ads_type_id))
		{
			$scope.ads_type_id = 0;
		}

		$scope.searchbox = searchbox;
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

	$scope.search_order_submit = function(sort_search){
		$scope.sort_search = sort_search;
		$scope.search_product($scope.searchbox,$scope.currentCategoryId,$scope.location_id,$scope.sub_category_id);
	}

	$scope.search_location_submit = function(){
		$scope.search_product($scope.searchbox,$scope.currentCategoryId,this.search_location,0);
	}

	$scope.search_category_submit = function(){
		$scope.search_product($scope.searchbox,this.search_category,$scope.location_id,0);
		$scope.get_sub_category(this.search_category);
	}

	$scope.search_sub_category_submit  = function(){
		$scope.search_product($scope.searchbox,$scope.currentCategoryId,$scope.location_id,this.search_sub_category);
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
			alert("Please check connection and try again.");
		});
	}

	/**
	 * if Category is selected Extended
	 * load a sub category
	 */
	$scope.selectSubCatExtended = function(){
		$scope.pagerloader = 1;
		$scope.pager++;
		if($scope.pager_no_result == 0){
			$http({
				method: 'GET',
				url: $scope.s_url+'get-ads/'+$scope.currentCategoryId+'/'+$scope.ads_type_id+'/'+$scope.selected_sidebar_sub_category+"?page="+$scope.pager
			}).then(function successCallback(response) {
				if(response.data.data.length == 0){
					$scope.pager_no_result = 1;
				}
				$scope.allAds = $scope.allAds.concat(response.data.data);
				$scope.pagerloader = 0;
			}, function errorCallback(response) {
				console.log(response);
				alert("Please check connection and try again.");
			});
		}else{
			$scope.pagerloader = 0;
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
			url: $scope.s_url+'add-favorites/'+product_id+'/'+$scope.user_id
		}).then(function successCallback() {
			$scope.usersFavoriteProducts.push(product_id);
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

	/**
	 * Remove Favorites
	 * Remove Id to array of Favorites
	 */
	$scope.RemoveFavorites = function(product_id){
		$http({
			method: 'POST',
			url: $scope.s_url+'remove-favorites/'+product_id+'/'+$scope.user_id
		}).then(function successCallback() {
			var index = $scope.usersFavoriteProducts.indexOf(product_id);
			if (index > -1) {
			    $scope.usersFavoriteProducts.splice(index, 1);
			}
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

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

			if($scope.activePage == 'new_ad'){
				$scope.unfinishedAdId = ads_id;
			}

			if($scope.activePage == 'ads_single'){
				$scope.updateComment(ads_id);
			}

			$scope.get_locations();

		}, function errorCallback(response) {
			// console.log(response);
			// alert("Please check connection and try again.");
		});
	}

	/**
	 * Update comment 
	 * on a single product
	 */
	$scope.updateComment = function(ads_id){
		$http({
			method: 'GET',
			url: $scope.s_url+'get_comments/'+ads_id
		}).then(function successCallback(response) {
			$scope.Comments = response.data;			
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

	/**
	 * check if user is logged
	 */
	$scope.checklogin = function(pageName){
		if($scope.user_id === 0){
			$scope.activePage = 'login';
		}else{
			$location.path(pageName+"/");
			$scope.activePage = pageName;

			$scope.splitroute = $location.path().split("/");
		}
	}

	/**
	 * Get Add Ads created by logged User
	 */
	$scope.getMyAds = function(){
		$http({
			method: 'GET',
			url: $scope.s_url+'my-ads/'+$scope.user_id
		}).then(function successCallback(response) {
			$scope.all_my_ads = response.data;
		}, function errorCallback(response) {
			console.log(response);
		});
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
	 * Get Users Favorite Products
	 */
	$scope.get_my_favorites = function(){
		if($scope.user_id !== 0){
			$http({
				method: 'POST',
				url: $scope.s_url+'get_my_favorites/'+$scope.user_id
			}).then(function successCallback(response) {
				$scope.my_favorites = response.data;
			}, function errorCallback(response) {
				console.log(response);
				alert("Please check connection and try again.");
			});
		}
	}

	/**
	 * Logout User
	 * Removes id to cookies
	 */
	$scope.logout = function(){
		$http({
			method: 'POST',
			url: $scope.s_url+'logout'
		}).then(function successCallback(response) {	
			$cookies.remove("user_id");
			$scope.user_id = 0;
			$cookies.remove("unfinishedAdId");
			$scope.unfinishedAdId = 0;
			$scope.redirect('category');
			$timeout(function () {
				location.reload();
            },1000);
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
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
				alert("Please check connection and try again.");
			});
		}else {
			console.log('invalid form');
		}
	}
	
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
			$http({
			method: 'POST',
			url: $scope.s_url+'register',
			data: {
				'formdata' : $scope.formData
			}
			}).then(function successCallback(response) {
				if(response.data == "added"){
					$scope.redirect('login');
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
				$scope.redirect('my_ads');
				$scope.user_id = response.data.user_id;
				$scope.welcome_user = response.data.message;
				$scope.hash = response.data.hash;
				$scope.getMyAds();
				$scope.getUserFavorites(response.data.user_id);
			}
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

	/**
	 * Get All Favorite Product
	 * Of the logged User
	 */
	$scope.getUserFavorites = function(user_id){
		$http({
			method: 'POST',
			url: $scope.s_url+'get-favorites/'+user_id
		}).then(function successCallback(response) {
			angular.forEach(response.data, function(value, key) {
				$scope.usersFavoriteProducts.push(value.ads_id);
			});
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
	}

	/**
	 * Adding comment to a single ad
	 */
	$scope.post_comment = function(ads_id){
		$http({
		method: 'POST',
		url: $scope.s_url+'comment',
		data: {
			'ads_id' : ads_id,
			'user_id' : $scope.user_id,
			'comment' : this.comment
		}
		}).then(function successCallback(response) {
			$scope.updateComment(ads_id);
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
		this.comment = "";
	}

	/**
	 * In Single ad view, theres a thumbnail of small images
	 * and a Large Image. when user click the Small Image
	 * It shows on the Large image
	 */
	$scope.zoom_gallery = function(zoom_img_path){
		$scope.zoom_img_path = zoom_img_path;
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
		url: $scope.s_url+'new_blank_ad/'+$scope.user_id
		}).then(function successCallback(response) {
			//if return is not number return 0
			if(isNaN(response.data))
			{
				response.data = 0;
			}
			if($scope.unfinishedAdId == 0){
				$cookies.put('unfinishedAdId',response.data);
				$scope.unfinishedAdId = response.data;
			}
			$scope.selectAds($scope.unfinishedAdId);
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
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
			alert("Please check connection and try again.");
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
				alert("Session Expired Pleas Login Again.")
				$scope.logout();
			}

			if(response.data.result == "failed"){
				$scope.errors = response.data.errors;
				//move to errors
				$location.hash('errors');
				$anchorScroll();
			}else if(response.data.result == "success"){
				console.log(response.data);
				$scope.unfinishedAdId = 0;
				$cookies.remove("unfinishedAdId");
				$scope.getMyAds();
				$scope.redirect('my_ads');	

				$timeout(function () {
					location.reload();
                },1000);
			}
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
                url: 'upload_ad_gallery/'+$scope.unfinishedAdId,
                data: {file: file}
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
	 * Get Only one Gallery by Id
	 * this is user for selecting the featured image
	 * this just shows the featured image selected on preview.
	 * this is not the method that updates the data.
	 */
    $scope.get_gallery_single = function(gallery_id){
    	$http({
		method: 'POST',
		url: $scope.s_url+'get_gallery_single/'+gallery_id
		}).then(function successCallback(response) {
			$scope.featured_gallery = response.data;
			//move to Preview
			$location.hash('preview');
			$anchorScroll();
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
		url: $scope.s_url+'set_featured_image/'+ad_id+"/"+gallery_id
		}).then(function successCallback(response) {
			$scope.get_gallery_single(gallery_id);
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
		url: $scope.s_url+'remove_gallery/'+gallery_id
		}).then(function successCallback(response) {
			$scope.get_gallery($scope.unfinishedAdId);
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
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
						alert("Please check connection and try again.");
					});
		    	}
		    });
	    }
    }

	/**
	 * Get Single Banner by banner_id
	 */
    $scope.get_banner_single = function(banner_id){
    	$scope.BigBannerSingle = "";
    	$scope.pagerloader = 1;
		$http({
			method: 'GET',
			url: $scope.s_url+'get_banner_single/'+banner_id
		}).then(function successCallback(response) {
			$scope.BigBannerSingle = response.data;
    		$scope.pagerloader = 0;
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

    /**
	 * Send request to admin for 
	 * making this ad a featured ad
	 */
    $scope.ask_featured_ad = function(ad_id,index){
     	$scope.all_my_ads[index].ask_featured = 1;

    	$http({
			method: 'POST',
			url: $scope.s_url+'ask_featured_ad/'+ad_id
		}).then(function successCallback(response) {
			
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

    /**
	 * remove request to admin for 
	 * making this ad a featured ad
	 */
    $scope.un_ask_featured_ad = function(ad_id,index){
    	$scope.all_my_ads[index].ask_featured = 0;

    	$http({
			method: 'POST',
			url: $scope.s_url+'un_ask_featured_ad/'+ad_id
		}).then(function successCallback(response) {
			
		}, function errorCallback(response) {
			console.log(response);
			alert("Please check connection and try again.");
		});
    }

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

    /**
	 * Submit Password form
	 * change user password
	 * And submit to logout
	 */
    $scope.changePasswordSubmit = function(){

    	if(this.newPassword == this.confirmNewPassword)
    	{
    		$scope.change_password_button = 1;
	    	$http({
				method: 'POST',
				url: $scope.s_url+'change_password',
				data: {'user_id':$cookies.get("user_id"),'oldPassword':this.oldPassword,'newPassword':this.newPassword}
			}).then(function successCallback(response) {
				if(response.data == 1){
					$('#changePassword').modal('hide');
					$scope.logout();
				}else{
					alert(response.data);
	    			$scope.change_password_button = 0;
				}
			}, function errorCallback(response) {
				console.log(response);
				alert("Please check connection and try again.");
			});
    	}
    	else
    	{
    		alert("New password and confirm password did not match.")
    	}
    }

    /**
	 * When the page reach the bottom
	 */
    angular.element($window).bind("scroll", function() {
	    var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
	    var body = document.body, html = document.documentElement;
	    var docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,  html.scrollHeight, html.offsetHeight);
	    windowBottom = windowHeight + window.pageYOffset;
	    if (windowBottom >= docHeight) {
	        if($scope.activePage == "subcategory"){
				$scope.selectSubCatExtended();
			}
	    }
	});

	/*PAGE INITIALIZER
	########################################################################
	########################################################################
	########################################################################
	*/	

	//Watch new pages
	$scope.$watch('splitroute', function(newVal, oldVal){
		//ON PAGE LOADS
		$scope.activePage = $scope.splitroute[1];
		$scope.activePageId = $scope.splitroute[2];

		$scope.url = $location.absUrl().split('?')[0];

		if($scope.activePage == "category"){
			$scope.get_category();
		}

		if($scope.activePage == 'bigbanner'){
			$scope.get_banner_single($scope.activePageId);
		}

		if($scope.activePage == "subcategory"){
			if($scope.activePageId !== ""){
				$scope.is_search = 0;
				$scope.selectSubCat($scope.activePageId);
			}else{
				$scope.is_search = 1;
			}

			$scope.get_sub_category($scope.activePageId);
		}

		if($scope.activePage == 'ads_single'){
			$scope.selectAds($scope.activePageId);
		}

		if($scope.activePage == "new_ad"){
			$scope.featured_gallery = 0;
			if(!angular.isUndefined($scope.activePageId) && $scope.activePageId !== '' && $scope.activePageId !== 0)
			{
				$scope.unfinishedAdId = $scope.activePageId;
				$scope.selectAds($scope.unfinishedAdId);
			}
			else if(!angular.isUndefined($scope.unfinishedAdId) && $scope.unfinishedAdId !== '' && $scope.unfinishedAdId !== 0)
			{
				$scope.selectAds($scope.unfinishedAdId);
			}
		}

		if($scope.activePage == "my_ads"){
			$scope.getMyAds();
		}

		if($scope.activePage == "favorites"){
			$scope.get_my_favorites();
		}

		if($scope.activePage == "search"){
			$('.search_order').val("");
			$('.search_location').val("");
			$('.search_category').val("");
			$('.search_sub_category').val("");
		}

	});

}]);

app.directive('toNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return parseInt(val, 10);
      });
      ngModel.$formatters.push(function(val) {
        return '' + val;
      });
    }
  }
})
