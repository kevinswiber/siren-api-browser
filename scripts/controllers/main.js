'use strict';

/* Controllers */

var sirenMainController = angular.module('sirenMainController', []);

sirenMainController.controller('MainCtrl', [
  '$scope'
  , '$state'
  , 'navigator'
  , 'appState'
  , function($scope, $state, navigator, appState) {
      $scope.init = function() {
        $scope.params = { url: appState.url || '' };
      };

      $scope.fetchUrl = function(params) {
        // TODO: Add URL validation here.
        var url = params.url;
        appState.url = url;
        navigator.transitionTo(url, { url: url });
      };
      $scope.projects = [
          {
            name: "Mini Factory Detroit",
            appUrl: "http://zetta-cloud.herokuapp.com/minifactory-detroit",
            location: {
              lat: 42.331389, 
              lon: -83.045833,
              name: "Detroit, MI"
            },
            online: true
          },
          {
            name: "Mini Factory SF",
            appUrl: "http://zetta-cloud.herokuapp.com/minifactory-san-francisco",
            location: {
              lat: 37.783333, 
              lon: -122.416667,
              name: "San Francisco, CA"
            },
            online: true
          },
          {
            name: "Mini Factory Bangalore",
            appUrl: "",
            location: {
              lat: 12.966667, 
              lon: 77.566667,
              name: "Bangalore, India"
            },
            online: false
          },
          {
            name: "Mini Factory San Jose",
            appUrl: "",
            location: {
              lat: 37.333333, 
              lon: -121.9,
              name: "San Jose, CA"
            },
            online: false
          },
          {
            name: "Mini Factory London",
            appUrl: "",
            location: {
              lat: 51.507222,
              lon: -0.1275,
              name: "London, England"
            },
            online: false
          },
          {
            name: "Home Automation",
            appUrl: "",
            location: {
              lat: 1.283333,
              lon: 103.833333,
              name: "Singapore"
            },
            online: false
          }
          
      
        ]
    }
    
]); //closure for .controller

