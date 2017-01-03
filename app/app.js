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
	
	obj.clearHistory = function (name) {
	    return $http.patch(serviceBase + 'clearHistory?name=' + name).then(function (status) {
	        return status.data;
			
	    });
	
	};
	
	  obj.insertWeather = function (weather) {
    return $http.post(serviceBase + 'insertWeather', weather).then(function (results) {
        return results;
    });
	}

     obj.getWeather = function(city){
        return $http.get(serviceBase + 'getWeather?city=' + city);
    }
	
	  obj.max_temperature = function(){
        return $http.get(serviceBase + 'max_temperature');
    }
	 
	 
    return obj;   
}]);

app.controller('listCtrl', function ($scope, services,$location,$http,$interval,$route) {
	
    services.getCities().then(function(data){
        $scope.cities = data.data;
    });
	
	 services.max_temperature().then(function(data){
        $scope.topcities = data.data;
    });
	
	   $scope.showCities = function() {
        $location.path('/');
     		
        services.getCities().then(function(data){
        $scope.cities = data.data;
    });   
        
    };
									
     $scope.saveCity = function(city) {
        $location.path('/');
     		
          services.insertCity(city);
		  $('.formData').slideUp(); 
		 
		 $scope.showCities();
        
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
		
    };
	
	  $scope.clearHistory = function(name_city) {
        $location.path('/');
     
            services.clearHistory(name_city);		  	
		    console.log("clear history of city : "+name_city);
       
      
    };
	
		
  $scope.showForecast=function(name){ 
   $http.get('https://api.hgbrasil.com/weather/?format=json&city_name='+name+'&key=31d8c6a1').
        then(function(response) {
             $scope.x = response.data;  
	   
	$scope.city_name=$scope.x.results.city_name;
	$scope.temp_act=$scope.x.results.temp;
	
	   
	$scope.temp_min=$scope.x.results.forecast[0].min;
	$scope.temp_max=$scope.x.results.forecast[0].max;		 
	
		 
		 $scope.weather = {temp_act: '', temp_min: '', temp_max: '', city: ''};
		 $scope.weather.temp_act=$scope.temp_act;
		 $scope.weather.temp_min=$scope.temp_min;
		 $scope.weather.temp_max=$scope.temp_max;
		 $scope.weather.city=$scope.city_name;	
		 
		 console.log($scope.weather);
		 
		   $scope.saveWeather($scope.weather);
		 
		$scope.weather = {temp_act: '', temp_min: '', temp_max: '', city: ''};  
	   
        });

}

    $scope.showWeather=function(name){ 
   $http.get('https://api.hgbrasil.com/weather/?format=json&city_name='+name+'&key=31d8c6a1').
        then(function(response) {
             $scope.x = response.data;  
	   
	$scope.city_name=$scope.x.results.city_name;
	$scope.temp_act=$scope.x.results.temp;	
	   
	$scope.temp_min=$scope.x.results.forecast[0].min;
	$scope.temp_max=$scope.x.results.forecast[0].max;		 
	
		 services.getWeather($scope.city_name).then(function(data){
        $scope.weathers = data.data;
    });
	 
        });

}


  $scope.getWeatherAllCities = function() {
        $location.path('/');
		  
		services.getCities().then(function(data){
        var cities = data.data;
		
			console.log("get weather of all cities in my database");
		
	for(var i=0;i<cities.length;i++) {
   
	//select weather for each city from api (by name)	
		
		$scope.showForecast(cities[i].name);		
	
    }
    });	
		
     };
	
	//************* save weather for each city every hour*********
	
	$interval($scope.getWeatherAllCities(), 3600000);
	
	//*********************************************************
	
 $scope.insertCityByCep=function(cep_city){ 
    $http.get('https://viacep.com.br/ws/'+cep_city+'/json/').
        then(function(response) {
             $scope.cep_data = response.data; 
	   
	       
	       console.log(" cityyy by cep  "+$scope.cep_data.localidade);
	   
	   //create object city and insert
	   $scope.city = {name: '', cep: '', created:''}; 
	   $scope.city.name=$scope.cep_data.localidade;
	   $scope.city.cep=cep_city;
	   //$scope.created=date.now();
	  							
	   console.log(" city to insert  "+$scope.city.name);
	   
       $scope.saveCity($scope.city);
	   $scope.city = {name: '', cep: '',created:''};
		services.getCities().then(function(data){
        $scope.cities = data.data;
    });
		
	   $('.formData').slideUp();      

	
        });

}
	

});


app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        title: 'Cities',
        templateUrl: 'index.html',
        controller: 'listCtrl'
      })
	    .when('/:name', {
        title: 'Cities',
        templateUrl: 'partials/cities.html',
        controller: 'listCtrl',
        resolve: {
          city: function(services, $route){
            var name = $route.current.params.name;
            return services.deleteCity(name);
          }
        }
      })
	 .when('/:city', {
        title: 'Cities',
        templateUrl: 'index.html',
        controller: 'listCtrl',
        resolve: {
          city: function(services, $route){
            var name= $route.current.params.name;
            return services.getWeather(name);
          }
        }
      })
	   .when('/:name', {
        title: 'Cities',
        templateUrl: 'index.html',
        controller: 'listCtrl',
        resolve: {
          city: function(services, $route){
            var name = $route.current.params.name;
            return services.clearHistory(name);
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

