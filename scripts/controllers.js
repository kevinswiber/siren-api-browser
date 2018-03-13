var SurfaceCtrls = {};

SurfaceCtrls.MainCtrl = function($scope, $state, $http, navigator, appState) {
  $scope.init = function() {
    $scope.params = {
      url: appState.url || '',
      headers: []
    };
  };

  $scope.fetchUrl = function(params) {
    var url = params.url,
        headers = params.headers;

    appState.url = url;
    headers.forEach(function (header) {
      if (
          header.key
          && header.value
          && header.key.length > 0
          && header.value.length > 0
      ) {
        $http.defaults.headers.common[header.key] = header.value;
      }
    });

    navigator.transitionTo(url, { url: url });
  };

  $scope.addHeader = function () {
    $scope.params.headers.push({
      key: '',
      value: ''
    });
  }

  $scope.removeHeader = function (index) {
    $scope.params.headers.splice(index, 1);
  }
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
    navigator.execute(action).then(function(result) {
      if (result.noop) {
        return;
      }

      var data = result.data;
      var config = result.config;

      $scope.main.properties = null;
      $scope.main.class = null;
      $scope.main.actions = [];
      $scope.main.entities = [];
      $scope.main.links = [];

      $scope.url = config.url;
      $state.params.url = config.url;

      showData(data);
    });
  };

  var showData = function(data) {
    if (typeof data === 'string') data = JSON.parse(data);

    $scope.main.properties = JSON.stringify(data.properties, null, 2);
    $scope.main.class = JSON.stringify(data.class);
    $scope.main.actions = data.actions;

    if (data.entities) {
      angular.forEach(data.entities, function(entity) {
        entity.properties = JSON.stringify(entity.properties, null, 2);
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
