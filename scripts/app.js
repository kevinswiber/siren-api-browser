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

  function textToSaturation(text) {
    var code = text.split('').map(function(c) {
      return c.charCodeAt(0);
    }).reduce(function(previous, current) {
      return previous + current;
    }, 0);

    return ((code * Math.floor(text.length/3)) % 100) + '%';
  }

  function drawCanvas(context, colors, cb) {
    var unitWidth = context.canvas.width / 36;
    var x = context.canvas.width - unitWidth;
    var y = 0;
    var width = unitWidth;
    var height = context.canvas.height;

    colors.forEach(function(color) {
      context.fillStyle = 'hsl(' + color.hue + ', ' + color.saturation + ', 50%)';
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

    var colors = [];
    function getColor() {
      return {
        hue: textToColor(scope.entity.raw.state),
        saturation: textToSaturation(scope.entity.raw.name)
      };
    };

    var last = getColor();
    colors.push(last);

    var index = 1;
    var interval = setInterval(function() {
      var last = getColor();
      colors.unshift(last);
      if (colors.length > 36) {
        colors = colors.slice(0, 35);
      }
      drawCanvas(context, colors);
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
.directive('zWampumBelt', ['$compile', function($compile) {
  function textToColor(text) {
    var code = text.split('').map(function(c) {
      return c.charCodeAt(0);
    }).reduce(function(previous, current) {
      return previous + current;
    }, 0);

    return code % 360;
  }

  function textToSaturation(text) {
    var code = text.split('').map(function(c) {
      return c.charCodeAt(0);
    }).reduce(function(previous, current) {
      return previous + current;
    }, 0);

    return ((code * Math.floor(text.length/3)) % 100) + '%';
  }

  var UNIT_SIZE = 10;

  function drawCanvas(context, colors, cb) {
    var unitWidth = context.canvas.width / 36;
    var x = context.canvas.width - unitWidth;
    var y = 0;
    var width = unitWidth;
    var height = UNIT_SIZE;//context.canvas.height;

    colors.forEach(function(row) {
      row.forEach(function(color) {
        context.fillStyle = 'hsl(' + color.hue + ', ' + color.saturation + ', 50%)';
        context.fillRect(x, y, width, height);
        x = x - unitWidth;
      });
      y = y + height;
      x = context.canvas.width - unitWidth;
    });

    if (cb) cb();
  }

  function link(scope, element, attrs) {
    var canvas = element.children()[0];
    var context = canvas.getContext('2d');

    function getColor(entity) {
      return {
        hue: textToColor(entity.raw.state),
        saturation: textToSaturation(entity.raw.name)
      };
    };

    scope.$watchCollection('main.entities', function() {
      if (scope.main.entities.length === 0) {
        return;
      }

      var unitSize = UNIT_SIZE;
      canvas.width = window.innerWidth;//unitSize * 36;
      canvas.height = scope.main.entities.length * unitSize;
      context.fillStyle = 'rgb(222, 222, 222)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      console.log('width:', canvas.width);
      console.log('height:', canvas.height);
      console.log('length:', scope.main.entities.length);

      var colors = [];
      angular.forEach(scope.main.entities, function(entity, i) {
        var last = getColor(entity);
        scope.$watchCollection('main', function() {
          //if (entity.streams.length === 0) {
            //return;
          //}

          console.log('name:', entity.raw.name);
          console.log('streams:', entity.streams);
        }, true);
        colors[i] = [];
        colors[i].push([last]);
      });
      
      var interval = setInterval(function() {
        angular.forEach(scope.main.entities, function(entity, i) {
          /*scope.$watchCollection(entity.streams, function() {
            //if (entity.streams.length === 0) {
              //return;
            //}

            //console.log('name:', entity.raw.name);
            //console.log('streams:', entity.streams);
          });*/
          var last = getColor(scope.main.entities[i]);
          colors[i].unshift(last);
          if (colors[i].length > 200) {
            colors[i] = colors[i].slice(0, 199);
          }
        });

        drawCanvas(context, colors);
      }, 50);
    });
  }

  return {
    restrict: 'E',
    scope: {
      main: '='
    },
    template: '<canvas class="wampum" id="wampum"></canvas>',
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

      /*if (!visible) {
        container.append($('<em>').text('No fields available.'));
      }*/

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
