var app = angular.module('myApp', ['ngRoute']);
app.factory("services", ['$http', function($http) {
  var serviceBase = 'services/'
    var obj = {};
    obj.getCities = function(){
        return $http.get(serviceBase + 'cities');
    }
    obj.getCity = function(name){
        return $http.get(serviceBase + 'city?name=' + name);
    }

    obj.insertCity = function (city) {
    return $http.post(serviceBase + 'insertCity', city).then(function (results) {
        return results;
    });
	};

	obj.deleteCity = function (name) {
	    return $http.delete(serviceBase + 'deleteCity?name=' + name).then(function (status) {
	        return status.data;
			
	    });
	
	};
	
	  obj.insertWeather = function (weather) {
    return $http.post(serviceBase + 'insertWeather', weather).then(function (results) {
        return results;
    });
	};


	
    return obj;   
}]);

app.controller('listCtrl', function ($scope, services,$location,$http) {
    services.getCities().then(function(data){
        $scope.cities = data.data;
    });
	
     $scope.saveCity = function(city) {
        $location.path('/');
     
            services.insertCity(city);
       
      
    };
	
	  $scope.deleteCity = function(city) {
        $location.path('/');
     
            services.deleteCity(city.name);		  	
		    console.log(" fct ctrl : city to delete name : "+city.name);
       
      
    };
	
	  $scope.saveWeather = function(weather) {
        $location.path('/');
     
		    console.log(" fct ctrl : weather/city  to insert : "+weather.city);
		 
            services.insertWeather(weather);
		  
		    console.log(weather);
		    console.log("city_name "+weather.city);
		    
      
    };
	
		
  $scope.showForecast=function(name){ 
   $http.get('https://api.hgbrasil.com/weather/?format=json&city_name='+name+'&key=31d8c6a1').
        then(function(response) {
             $scope.x = response.data;
  
	   
	$scope.city=$scope.x.results.city;
	$scope.temp_act=$scope.x.results.temp;
	   
	 for(var i=0;i<$scope.x.results.forecast.length;i++) {  
	   
	$scope.temp_min=$scope.x.results.forecast[0].min;
	$scope.temp_max=$scope.x.results.forecast[0].max;
		 
		console.log("city "+$scope.city+ " temp actuelle : "+$scope.temp_act+" temp min : "+$scope.temp_min +" temp max :"+$scope.temp_max);
		 
		 
		   $scope.saveWeather($scope.x.results);
		 
	 }
        });

}



  $scope.getWeatherAllCities = function() {
        $location.path('/');
		  
		services.getCities().then(function(data){
        var cities = data.data;
		
			console.log("get weather of all cities in my database");
		
	for(var i=0;i<cities.length;i++) {
   
	//select weather for each city from api (by name)	
		
		//var city=cities[i].name;
		$scope.showForecast(cities[i].name);		
	
    }
    });	
		
     };




	
});


app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        title: 'Cities',
        templateUrl: 'partials/cities.html',
        controller: 'listCtrl'
      })
	    .when('/:name', {
        title: 'Cities',
        templateUrl: 'partials/cities.html',
        controller: 'listCtrl',
        resolve: {
          customer: function(services, $route){
            var name = $route.current.params.name;
            return services.deleteCity(name);
          }
        }
      })
	    .when('/', {
        title: 'Cities',
        templateUrl: 'partials/cities.html',
        controller: 'listCtrl',
        resolve: {
          customer: function(services, $route){
            var name = $route.current.params.weather;
            return services.saveWeather(weather);
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);