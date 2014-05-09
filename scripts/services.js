'use strict';

/* Services */

var sirenServices = angular.module('sirenServices', []);

// A way to connect to and display streaming data 

sirenServices.factory('getStreams', ['$q', '$http',
  function($q, $http) {
      return {
        atURL:function(href){
          var entity = $q.defer(); //I promise 
            
          $http.get(href).success(function(response) { 
            //default response
            var e = {
              streams: {},
              actions: {},
              totalStreams: 0,
              totalActions: 0
            };
          
            if (response.actions) {
              //go over each action
              angular.forEach(response.actions, function(action) {
                if (action.class && action.class.indexOf('event-subscription') !== -1) {
//                if it has a stream, add it to e
                  var stream = {
                    action: action,
                    name: action.name.replace(/\//g, '_'),
                    data: [],
                    xFunction: function(){ return function(d){ return d[0]; } },
                    yFunction: function(){ return function(d){ return d[1]; } },
                    xTickFunction: function(d3) { return d3.time.format('%H:%M:%S'); },
                    min: null,
                    max: null
                  };
                  e.streams[stream.name] = stream;
                  e.totalStreams++;
                } else {
//                if it has another action type, add it to e                  
                  var act = { 
                    name: action.name.replace(/\//g, '_'),
                    action: action
                  }
                  angular.extend(act, action);
                  e.actions[act.name] = act;
                  e.totalActions++;
                  
                }
              });
            }
            entity.resolve(e);
          });
          return entity.promise;
        }// /atURL
      }
    }
                                       
]);

//Breadcrumbs
//sirenServices.factory('breadcrumbs', ['$q', '$http',
