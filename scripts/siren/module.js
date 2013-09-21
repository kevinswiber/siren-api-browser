angular
  .module('siren', ['ui.state'])
  .provider('classRouter', function() {
      var map = {};

      this.when = function(klass, state) {
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
  }]);
