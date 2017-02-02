// create the module and name it app
var app = angular.module('app', ['ngRoute']);

// configure our routes
app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl : 'app/home/home.html',
			controller  : 'homeController'
		})
		.when('/subcategory/:category_id', {
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
		});
});