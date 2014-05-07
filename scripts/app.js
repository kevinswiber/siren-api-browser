var siren = angular
  .module('zetta', [
    'siren'
    , 'ui.state'
    , 'ngAnimate'
    , 'luegg.directives'
    , 'sirenFilters'
    , 'sirenAppController'
    , 'sirenEntityController'
    , 'sirenMainController'
    , 'sirenServices'
    , 'leaflet-directive'
    , 'akoenig.deckgrid'
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
      context.fillStyle = 'hsl(' + color.hue + ', ' + color.saturation + ', ' + color.lightness + ')';
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
        saturation: textToSaturation(scope.entity.raw.name),
        lightness: '50%'
      };
    };

    function getTransitionColor(transition) {
      return {
        hue: textToColor(transition),
        saturation: '50%',
        lightness: '80%'
      };
    }

    var last = getColor();
    colors.push(last);

    var lastTransitionTimer;
    scope.$watch('entity.lastTransition', function() {
      if (scope.entity.lastTransition === null) {
        return;
      }

      colors.unshift(getTransitionColor(scope.entity.raw.state));

      clearTimeout(lastTransitionTimer);
      lastTransitionTimer = setTimeout(function() {
        scope.entity.lastTransition = null;
      }, 1000);
    });

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
.directive('sparkline', ['$compile', function($compile){

  function link(scope, element, attrs) {
      
        
     scope.$watchCollection('stream', function() {
      //console.log("link stream: ", scope.stream);
          stream = scope.stream.map(function(item){
            return {'x': parseInt(item[0].getTime()), 'y': item[1]};
          }); 
      
          var x = d3.time.scale().range([0, scope.width]);
          var y = d3.scale.linear().range([scope.height, 0]);
      
          x.domain(d3.extent(stream, function(d) {return d.x}));
          y.domain(d3.extent(stream, function(d) {return d.y}));

          scope.line = d3.svg.line()
              .x(function(d) {return x(d.x);})
              .y(function(d) {return y(d.y);});
       
          element.find('path').attr({"d": scope.line(stream)});
    }); 

  }
  return {
    restrict: 'E',
    scope: {
      stream: '=',
      width: '=',
      height: '='
    },
    templateUrl: 'partials/sparkline.html',
    link: link
  };
}])
.directive('zWampumBelt', ['$compile', function($compile) {
  function textToColor(text) {
    var code = text.toString().split('').map(function(c) {
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
    var transitionWidth = unitWidth;
    var x = context.canvas.width - unitWidth;
    var y = 0;
    var width = unitWidth;
    var height = UNIT_SIZE;//context.canvas.height;

    colors.forEach(function(row) {
      row.state.forEach(function(block) {
        var w;

        switch(block.type) {
          case 'transition': 
            w = transitionWidth;
            break;
          case 'state':
            w = width;
            break;
        }

        context.fillStyle = 'hsl(' + block.color.hue + ', ' + block.color.saturation + ', ' + block.color.lightness + ')';
        context.fillRect(x, y, w, height);
        x = x - unitWidth;
      });

      y = y + height;
      x = context.canvas.width - unitWidth;

      if (row.streams.length) {
        row.streams.forEach(function(strm) {
          strm.forEach(function(color) {
            context.fillStyle = 'hsl(' + color.hue + ', ' + color.saturation + ', 50%)';
            //context.fillStyle = 'hsl(' + color.hue + ', 100%, 50%)';
            context.fillRect(x, y, width, height);
            x = x - unitWidth;
          });
          y = y + height;
          x = context.canvas.width - unitWidth;
        });
      }
    });

    if (cb) cb();
  }

  function link(scope, element, attrs) {
    var canvas = element.children()[0];
    var context = canvas.getContext('2d');

    function getColor(entity) {
      return {
        hue: textToColor(entity.raw.state),
        saturation: textToSaturation(entity.raw.name),
        lightness: '50%'
      };
    };

    function getStreamColor(name, value) {
      return {
        hue: textToColor(value),
        saturation: textToSaturation(name),
        lightness: '50%'
      };
    }

    function getTransitionColor(transition) {
      return {
        hue: textToColor(transition),
        saturation: '50%',
        lightness: '80%'
      };
    }

    scope.$watchCollection('main.entities', function() {
      if (scope.main.entities.length === 0) {
        return;
      }

      var unitSize = UNIT_SIZE;
      canvas.width = window.innerWidth;//unitSize * 36;
      canvas.height = scope.main.entities.length * unitSize;
      context.fillStyle = 'rgb(222, 222, 222)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      var colors = [];

      window.onresize = function() {
        console.log('resizing');
        canvas.width = window.innerWidth;//unitSize * 36;
        canvas.height = scope.main.entities.length * unitSize;
        context.fillStyle = 'rgb(222, 222, 222)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawCanvas(context, colors);
      };

      angular.forEach(scope.main.entities, function(entity, i) {
        var last = getColor(entity);
        var block = {
          type: 'state',
          color: last
        };

        colors[i] = {};
        colors[i].state = [];
        colors[i].streams = [];
        colors[i].state.push(block);

        var identifier = 'main.entities[' + i + ']';
        var lastTransitionIdentifier = identifier + '.lastTransition';
        scope.$watch(lastTransitionIdentifier, function() {
          if (scope.main.entities[i].lastTransition === null ||
              scope.main.entities[i].lastTransition === undefined) {
            return;
          }

          var block = {
            type: 'transition',
            color: getTransitionColor(scope.main.entities[i].raw.state)
          };

          colors[i].state.unshift(block);
        });

        var watchedStream = [];

        scope.$watchCollection(identifier, function() {

          var keys = Object.keys(entity.streams);

          console.log(keys);
          if (keys.length === 0) {
            return;
          }

          angular.forEach(keys, function(key) {
            if (watchedStream.indexOf(key) !== -1) {
              return;
            }

            watchedStream.push(key);
            console.log(key);
            canvas.height += unitSize;
            console.log(canvas.height);
            colors[i].streams.push([]);
            var streamIndex = colors[i].streams.length - 1;

            scope.$watchCollection('main.entities[' + i + '].streams["' + key + '"].data', function() {
              var d = entity.streams[key].data;
              if (d.length === 0) {
                return;
              }
              var arr = d[d.length - 1];
              var c = { hue: (Math.abs(arr[1].toFixed(0) % 360)), saturation: '100%' };
              colors[i].streams[streamIndex].unshift(c);
            });
          });
        }, true);
      });
      
      var interval = setInterval(function() {
        angular.forEach(scope.main.entities, function(entity, i) {
          var last = getColor(scope.main.entities[i]);
          var block = {
            type: 'state',
            color: last
          };
          colors[i].state.unshift(block);
          colors[i].state = colors[i].state.slice(0, 49);
          colors[i].streams.forEach(function(strm, j) {
            var streamColors = colors[i].streams[j];
            var last = streamColors[0];

            if (last) {
              colors[i].streams[j].unshift(last);
            }
            colors[i].streams[j] = colors[i].streams[j].slice(0, 49);
          });
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
    template: '<canvas class="wampum" id="wampum" width="100%"></canvas>',
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
