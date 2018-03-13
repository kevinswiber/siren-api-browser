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

    $http.defaults.headers.common.Accept = 'application/vnd.siren+json, application/json, text/plain, */*';
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
      execute: function(action) {
        var contentType = action.type || 'application/x-www-form-urlencoded';
        var options = {
          method: action.method || 'GET',
          url: action.href,
          headers: {
            'Content-Type': contentType,
            'Accept': 'application/vnd.siren+json, application/json, text/plain, */*'
          }
        };

        if (options.method === 'GET') {
          var params = {};

          angular.forEach(action.fields, function(field) {
            params[field.name] = field.value;
          });

          var url = options.url;

          var serialize = function(obj) {
            var str = [];
            for(var p in obj)
              if (obj.hasOwnProperty(p)) {
                if (typeof obj[p] != 'undefined') {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
              }
            return str.join("&");
          };

          url = url.split('?')[0] + '?' + serialize(params); 

          $state.transitionTo('entity', { url: url });

          var deferred = $q.defer();

          deferred.resolve({ noop: true });

          return deferred.promise;
        } else {
          if (contentType === 'application/json' 
             || (contentType.startsWith('application/vnd') && contentType.endsWith('json')) ) {
            options.data = {};
            angular.forEach(action.fields, function(field) {
              options.data[field.name] = field.value;
            });
          } else if (contentType === 'application/x-www-form-urlencoded') {
            var data = [];
            angular.forEach(action.fields, function(field) {
              data.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value));
            });
            if (data.length === 0) {
                options.data = {};
            } else {
                options.data = data.join('&');
            }
          }
          
          var deferred = $q.defer();

          $http(options).success(function(data, status, headers, config) {
            deferred.resolve({ data: data, config: config });
          })
          .error(function(data, status, headers, config) {
            deferred.reject(status);
          });

          return deferred.promise;
        }
      }
    };
  }]);
