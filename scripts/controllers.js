var SurfaceCtrls = {};

SurfaceCtrls.MainCtrl = function($scope, $state, navigator, appState) {
  $scope.init = function() {
    $scope.params = { url: appState.url || '' };
  };

  $scope.fetchUrl = function(params) {
    var url = params.url;
    appState.url = url;
    navigator.transitionTo(url, { url: url });
  };
};

SurfaceCtrls.HomeCtrl = function($scope, $state, navigator, appState) {
  $scope.init = function() {
    $scope.model = { collection: null, query: null };
    $scope.fields = {};

    $scope.model.url = appState.url = $state.params.url;

    $scope.model.url = appState.url;
    $scope.model.collection = appState.collection;
    $scope.model.query = appState.query;

    navigator.fetch($state.params.url, $state.params).then(function(data) {
      angular.forEach(data.actions, function(action) {
        if (action.name === 'search') {
          angular.forEach(action.fields, function(field) {
            $scope.fields[field.name] = field;
          });
        }
      });

      if (!$scope.model.collection || $scope.model.collection === '') {
        $scope.model.collection = $scope.fields.collection.value[0];
      }

      if (!$scope.model.query || $scope.model.query === '') {
        $scope.model.query = $scope.fields.query.value;
      }
    });
  };

  $scope.search = function(fields) {
    var rootUrl = appState.url = fields.url;
    var collection = appState.collection = fields.collection;
    var query = appState.query = fields.query;

    var url = SurfaceCtrls.Common.buildUrl(rootUrl, collection, query);
    
    var params = fields;

    navigator.execute('search', fields, params);
  };
};

SurfaceCtrls.EntityCtrl = function($scope, $state, $http, $location, navigator) {
  $scope.init = function() {
    var params = $state.params;
    var rootUrl = params.url;
    var collection = params.collection;
    var query = params.query;

    follow(rootUrl, collection, query);
  };

  $scope.go = function(url) {
    $state.transitionTo('entity', { url: url });
  };

  $scope.execute = function(action) {
    var options = {
      method: action.method || 'GET',
      url: action.href
    };

    if (options.method === 'GET') {
      var params = {};
      console.log(action.fields);
      angular.forEach(action.fields, function(field) {
        params[field.name] = field.value;
      });

      var url = options.url;

      var serialize = function(obj) {
        var str = [];
        for(var p in obj)
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }
        return str.join("&");
      };

      url = url.split('?')[0] + '?' + serialize(params); 

      $state.transitionTo('entity', { url: url });
      return;
    } else {
      $http(options).success(function(data, status, headers, config) {
        console.log('success');
        console.log(config);
        console.log(data);

        $scope.main.properties = null;
        $scope.main.class = null;
        $scope.main.actions = [];
        $scope.main.entities = [];

        $scope.url = config.url;
        $state.params.url = config.url;

        showData(data);
      })
      .error(function(data, status, headers, config) {
        console.log('error');
        console.log(status);
      });
    }
  };

  var showData = function(data) {
    if (typeof data === 'string') data = JSON.parse(data);

    /*angular.forEach(data.properties, function(value, key) {
      $scope.main.properties.push({ key: key, value: value });
    });*/

    $scope.main.properties = JSON.stringify(data.properties, null, 2);
    $scope.main.class = JSON.stringify(data.class);
    $scope.main.actions = data.actions;

    if (data.entities) {
      angular.forEach(data.entities, function(entity) {
        entity.properties = JSON.stringify(entity.properties, null, 2);
        /*if (entity.properties) {
          var properties = []
          angular.forEach(entity.properties, function(value, key) {
            properties.push({ key: key, value: value });
          });

          entity.properties = properties;
        }*/

        var heading = [];

        if (entity.class) {
          heading.push('class: ' + JSON.stringify(entity.class));
        }

        if (entity.rel) {
          heading.push('rel: ' + JSON.stringify(entity.rel));
        }

        entity.heading = heading.join(', ') || '[unknown class]';

        if (entity.links) {
          var links = [];
          angular.forEach(entity.links, function(link) {
            angular.forEach(link.rel, function(rel) {
              links.push({ rel: rel, href: link.href });
            });
          });

          entity.links = links;
        }

        $scope.main.entities.push(entity);
      });
    };

    if (data.links) {
      angular.forEach(data.links, function(link) {
        angular.forEach(link.rel, function(rel) {
          $scope.main.links.push({ rel: rel, href: link.href });
        });
      });
    }
  };

  var follow = function(rootUrl, collection, query) {
    var url = SurfaceCtrls.Common.buildUrl(rootUrl, collection, query);

    $scope.main = {
      properties: [],
      entities: [],
      links: []
    };

    $scope.isOneAtATime = true;
    $scope.url = url;

    $state.params.url = url;
    $state.params.collection = collection;
    $state.params.query = query;

    navigator.redirectOrFetch(url, $state.params).then(function(data) {
      showData(data);
    });
  };
};

SurfaceCtrls.Common = {
  buildUrl: function(rootUrl, collection, query) {
    var url = '';
    if (rootUrl) {
      url += rootUrl;
    }
    if (collection) {
      if (url.slice(-1) === '/') {
        url = url.slice(0, -1);
      }
      url += '/' + encodeURIComponent(collection);
    }
    if (query) {
      url += '?query=' + encodeURIComponent(query);
    }

    return url;
  }
};
