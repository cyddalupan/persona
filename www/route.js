// create the module and name it app
var app = angular.module('app', ['ngCookies','ngRoute','ngFileUpload']);

// configure our routes
app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'app/home/home.html',
			controller  : 'homeController'
		})
		.when('/subcategory/:category_id/:category_name*', {
			templateUrl : 'app/subcategory/subcategory.html',
			controller  : 'subCategoryController'
		})
		.when('/mobile', {
			templateUrl : 'app/mobile/mobile.html',
			controller  : 'mobileController'
		})
		.when('/contactus', {
			templateUrl : 'app/contactus/contactus.html',
			controller  : 'contactusController'
		})
		.when('/register', {
			templateUrl : 'app/register/register.html',
			controller  : 'registerController'
		})
		.when('/login', {
			templateUrl : 'app/login/login.html',
			controller  : 'loginController'
		})
		.when('/search/:searchbox/:category_id/:location_id/:sub_category_id/:search_order', {
			templateUrl : 'app/search/search.html',
			controller  : 'searchController'
		})
		.when('/ads_single/:ad_id', {
			templateUrl : 'app/ads_single/ads_single.html',
			controller  : 'adsSingleController'
		})
		.when('/favorites', {
			templateUrl : 'app/favorites/favorites.html',
			controller  : 'favoritesController'
		})
		.when('/my_ads', {
			templateUrl : 'app/my_ads/my_ads.html',
			controller  : 'my_adsController'
		})
		.when('/new_ad/:ad_id', {
			templateUrl : 'app/new_ad/new_ad.html',
			controller  : 'new_adController'
		})
		.when('/notification', {
			templateUrl : 'app/notification/notification.html',
			controller  : 'notificationController'
		});
});