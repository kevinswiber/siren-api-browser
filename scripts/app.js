angular
  .module('surface', ['siren', 'ui.state', 'ui.bootstrap'])
  .config(['classRouterProvider', '$stateProvider',
      function(classRouterProvider, $stateProvider) {

    // Route Siren entity classes to UI states.
    classRouterProvider
      //.when(['home'], 'home')
      .otherwise('entity');

    // Configure UI states for app.
    $stateProvider
      .state('index', {
        url: '',
        templateUrl: 'partials/start.html',
        controller: 'MainCtrl'
      })
      /*.state('home', {
        url: '/home?url',
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl'
      })*/
      .state('entity', {
        url: '/entity?url&collection&query',
        templateUrl: 'partials/entity.html',
        controller: 'EntityCtrl'
      });
  }])
  .controller('MainCtrl',
      ['$scope', '$state', 'navigator', 'appState', SurfaceCtrls.MainCtrl])
  /*.controller('HomeCtrl',
      ['$scope', '$state', 'navigator', 'appState', SurfaceCtrls.HomeCtrl])*/
  .controller('EntityCtrl',
      ['$scope', '$state', '$location', 'navigator', SurfaceCtrls.EntityCtrl])
  .controller('NavCtrl', ['$scope', function($scope) {
    $scope.switch = function(config) {
    };
  }])
  .factory('appState', function() {
    return { url: '', collection: '', query: '' };
  })
  .filter('encodeURIComponent', function() {
    return window.encodeURIComponent;
  })
  .filter('prettify', function() {
    return function(obj) {
      return JSON.stringify(obj, null, 2);
    };
  })
  .directive('selectOnClick', function() {
    return function(scope, element, attrs) {
      element.bind('click', function() {
        element[0].select();
      });
    };
  });
