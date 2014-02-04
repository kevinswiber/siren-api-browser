angular
  .module('siren', ['ui.state'])
  .provider('classRouter', function() {
      var map = {};

      this.when = function(klass, state) {
        if (!klass) {
          map[null] = { known: false, state: state };
          return this;
        }
        var c = klass.sort().join(' ');
        map[c] = { known: true, state: state };
        return this;
      };
      
      this.otherwise = function(state) {
        map[null] = { known: false, state: state };
      };

      this.$get = function() {
        return {
          resolve: function(klass) {
            if (!klass) {
              return map[null];
            }
            var c = klass.sort().join(' ');
            return map[c] || map[null];
          }
        };
      };
  })
  .factory('navigator', ['$http', '$rootScope', '$q', '$state', 'classRouter',
      function($http, $rootScope, $q, $state, classRouter) {
    return {
      cache: [],
      current: null,
      redirectOrFetch: function(url, params) {
        return this.fetch(url, params, true);
      },
      fetch: function(url, params, redirectIfKnown) {
        if (this.cache.length) {
          this.current = this.cache.pop();
          return $q.when(this.current.entity);
        }

        var immediateReturn = true;

        return this.transitionTo(url, params, immediateReturn, redirectIfKnown);
      },
      transitionTo: function(url, params, immediateReturn, redirectIfKnown) {
        if (typeof url === 'object' && url.href) {
          url = url.href;
        }

        var self = this;
        var deferred = $q.defer();

        $http.get(url).success(function(data, status, headers, config) {
          var state = classRouter.resolve(data.class);

          self.current = { state: state, entity: data };

          // only cache if the following state must fetch.
          if (!immediateReturn || (redirectIfKnown && state.known)) {
            self.cache.push(self.current);
          }
          
          $rootScope.$broadcast('entityChangeSuccess', data);

          $state.transitionTo(state.state, params);

          var stateIsUnknown = !state.known;
          var resolveIfKnown = !redirectIfKnown;
          
          
          if (immediateReturn && (stateIsUnknown || resolveIfKnown)) {
            deferred.resolve(data);
          }
        });

        if (immediateReturn) {
          return deferred.promise;
        }
      },
      execute: function(name, fields, stateParams, redirectIfKnown) {
        var action;
        angular.forEach(this.current.entity.actions, function(a) {
          if (a.name === name) {
            action = a;
          }
        });

        if (action) {
          var deferred = $q.defer();

          var config = {
            method: action.method || 'GET',
            url: action.href
          };

          if (config.method === 'GET') {
            config.params = fields;
          } else {
            config.data = fields;
          }

          var self = this;

          $http(config).success(function(data) {
            var state = classRouter.resolve(data.class);

            self.current = { state: state, entity: data };
            self.cache.push(self.current);

            $state.transitionTo(state.state, stateParams);

            if (state.known && !redirectIfKnown) {
              deferred.resolve(data);
            }
          });

          return deferred.promise;
        }
      }
    };
  }])
  .directive('srnAction', function($compile) {
    function link(scope, element, attrs) {
      if (!scope.action) {
        return;
      }

      var container = $('<div>');
      var inputHtml = '';
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
        container.append(label).append(controls);
      };

      element.replaceWith(container);
    }

    return {
      restrict: 'E',
      scope: {
        action: '=value'
      },
      link: link
    };
  });;
