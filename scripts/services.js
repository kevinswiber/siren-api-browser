'use strict';

/* Services */

var sirenServices = angular.module('sirenServices', []);

sirenServices.factory('getStreams', ['$q', '$http',
  function($q, $http) {
      return {
        atURL:function(href){
          var entity = $q.defer();
            
          $http.get(href).success(function(response) { 
            var e = {
              streams: {},
              totalStreams: 0
            };
          
            if (response.actions && response.actions.length) {
              angular.forEach(response.actions, function(action) {
                if (action.class && action.class.indexOf('event-subscription') !== -1) {
                  var stream = {
                    action: action,
                    name: action.name.replace(/\//g, '_'),
                    data: [],
                    xFunction: function(){ return function(d){ return d[0]; } },
                    yFunction: function(){ return function(d){ return d[1]; } },
                    xTickFunction: function(d3) { return d3.time.format('%H:%M:%S'); }
                  };

                  e.streams[stream.name] = stream;
                  e.totalStreams++;

                }
              });
            }
            entity.resolve(e);
            //console.log("factory entity: ", entity);
            
          });
          return entity.promise;
        }// /atURL
        
      }
      
      
    
    }
                                       
]);