var siren = angular
  .module('elroy', [
    'siren'
    , 'ui.state'
    , 'ngAnimate'
    , 'nvd3ChartDirectives'
    , 'luegg.directives'
    , 'sirenFilters'
    , 'sirenAppController'
    , 'sirenEntityController'
    , 'sirenMainController'
    , 'sirenServices'
  ]);

  siren.config([
    'classRouterProvider'
    , '$stateProvider'
    , function(classRouterProvider, $stateProvider) {
      // Route Siren entity classes to UI states.
      classRouterProvider
        .when(['app'], 'app')
        .otherwise('entity');

      // Configure UI states for app. (this should be rolled up into the .when declarations above
      $stateProvider
        .state('index', {
          url: '',
          templateUrl: 'partials/start.html',
          controller: 'MainCtrl'
        })
        .state('app', {
          url: '/app?url',
          templateUrl: 'partials/app.html',
          controller: 'AppCtrl'
        })
        .state('entity', {
          url: '/entity?url',
          templateUrl: 'partials/entity.html',
          controller: 'EntityCtrl'
        });
    }
  ])
  .factory('appState', function() {
    return { url: '', collection: '', query: '' };
  })
  .directive('selectOnClick', function() {
    return function(scope, element, attrs) {
      element.bind('click', function() {
        element[0].select();
      });
    };
  }).directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])
.directive('zDnaStrip', ['$compile', function($compile) {
  function textToColor(text) {
    var code = text.split('').map(function(c) {
      return c.charCodeAt(0);
    }).reduce(function(previous, current) {
      return previous + current;
    }, 0);

    return code % 360;
  }

  function drawCanvas(context, hues, cb) {
    var unitWidth = context.canvas.width / 36;
    var x = context.canvas.width - unitWidth;
    var y = 0;
    var width = unitWidth;
    var height = context.canvas.height;

    hues.forEach(function(hue) {
      context.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
      context.fillRect(x, y, width, height);
      x = x - unitWidth;
    });

    if (cb) cb();
  }

  function link(scope, element, attrs) {
    var canvas = element.children()[0];
    var context = canvas.getContext('2d');

    context.fillStyle = 'rgb(222, 222, 222)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    var hues = [];
    function getColor() {
      return textToColor(scope.entity.raw.state);
    };

    var last = getColor();
    hues.push(last);

    var index = 1;
    var interval = setInterval(function() {
      var last = getColor();
      hues.unshift(last);
      if (hues.length > 36) {
        hues = hues.slice(0, 35);
      }
      drawCanvas(context, hues);
    }, 50);
  }

  return {
    restrict: 'E',
    scope: {
      entity: '='
    },
    templateUrl: 'partials/dna-strip.html',
    link: link
  };
}])
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
	
	if(field.type === 'file'){
	  input.attr('file-model','action.fields[' + i + '].file');
	}
	
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
  }])
