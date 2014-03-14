

angular
  .module('surface', ['siren', 'ui.state', 'ui.bootstrap', 'ngAnimate', 'nvd3ChartDirectives'])
  .config(['classRouterProvider', '$stateProvider',
      function(classRouterProvider, $stateProvider) {

    // Route Siren entity classes to UI states.
    classRouterProvider
      .otherwise('entity');

    // Configure UI states for app.
    $stateProvider
      .state('index', {
        url: '',
        templateUrl: 'partials/start.html',
        controller: 'MainCtrl'
      })
      .state('entity', {
        url: '/entity?url',
        templateUrl: 'partials/entity.html',
        controller: 'EntityCtrl'
      });
  }])
  .controller('MainCtrl',
      ['$scope', '$state', 'navigator', 'appState', SurfaceCtrls.MainCtrl])
  .controller('EntityCtrl',
      ['$scope', '$sce', '$state', '$http', '$location', 'navigator', SurfaceCtrls.EntityCtrl])
  .factory('appState', function() {
    return { url: '', collection: '', query: '' };
  })
  .filter('encodeURIComponent', function() {
    return window.encodeURIComponent;
  })
  .filter('prettify', function() {
    return function(obj) {
      return JSON.stringify(obj, function(key, val) {
        return (key === '$$hashKey') ? undefined : val;
      }, 2);
    };
  })
  .directive('selectOnClick', function() {
    return function(scope, element, attrs) {
      element.bind('click', function() {
        element[0].select();
      });
    };
  })
  .directive('srnAction', ['$compile', 'navigator', function($compile, navigator) {
    function link(scope, element, attrs) {
      if (!scope.action) {
        return;
      }

      var container = $('<div>');
      var visible = false;

      for(var i = 0; i < scope.action.fields.length; i++) {
        var field = scope.action.fields[i];

        var label = $('<label>')
          .addClass('control-label')
          .attr('for', scope.action.name + field.name)
          .text(field.title || field.name);

        var controls = $('<div>').addClass('controls');

        var input = $('<input>')
          .attr('name', field.name)
          .attr('id', scope.action.name + field.name)
          .attr('type', field.type || 'text')
          .attr('ng-model', 'action.fields[' + i + '].value')
          .val(field.value);


        $compile(input)(scope);

        controls.append(input);

        if (field.type !== 'hidden') {
          visible = true;
          container.append(label);
        }

        container.append(controls);
      };

      if (!visible) {
        container.append($('<em>').text('No fields available.'));
      }

      element.replaceWith(container);
    }

    return {
      restrict: 'E',
      scope: {
        action: '=value'
      },
      link: link
    };
  }]);
