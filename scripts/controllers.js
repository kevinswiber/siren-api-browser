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

SurfaceCtrls.EntityCtrl = function($scope, $sce, $state, $http, $location, navigator) {
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
	  
	 
	  
    if (action.class.indexOf('event-subscription') !== -1) {
      
		 
	  //console.log($scope.main.properties.raw.sreams);	
	  var ws = new WebSocket(action.href);

      ws.onmessage = function(event) {
		//Add data to model w/ timestamp here
        console.log(JSON.parse(event.data));
      }

      var command = { cmd: action.method };
      action.fields.forEach(function(field) {
        command[field.name] = field.value;
      });

      ws.onopen = function(event) {
        ws.send(JSON.stringify(command));
      };

      return;
    }

    navigator.execute(action).then(function(result) {
      if (result.noop) {
        return;
      }

		
		
		
      var data = result.data;
      var config = result.config;

      $scope.main.class = null;
      $scope.main.actions = [];
      $scope.main.entities = [];
      $scope.main.links = [];
      $scope.formattedDiff = "";
      $scope.main.breadcrumbs = [];

      $scope.url = config.url;
      $state.params.url = config.url;

      showData(data);
    });
  };
	
	
  var showData = function(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

	
	  
    $scope.main.properties.old = $scope.main.properties.raw;
    $scope.main.properties.text = "<pre>" + JSON.stringify(data.properties, null, 2) + "</pre>";
    $scope.main.properties.raw = data.properties;
    $scope.main.properties.diff = { raw: null, html: null };

    $scope.formattedDiff = $sce.trustAsHtml($scope.main.properties.text);
	  
    $scope.main.class = JSON.stringify(data.class);
    $scope.main.actions = data.actions;
    $scope.main.stateClass = 'label-info';
	  
    var oldState = $scope.main.state;
	
    if (data.properties && data.properties.state) {
      $scope.main.state = data.properties.state;
    }
  
	if(!$scope.main.streams){  
		console.log("initialize data streams");
		$scope.main.streams = {
			_state: {
					name: '_state',
					data: []
				}
		}
		angular.forEach($scope.main.properties.raw.streams, function(stream){
			$scope.main.streams[stream] = {
				name: stream,
				data: []
			}
		});
		console.log($scope.main.streams);
	}
	  
    if (oldState !== undefined && oldState !== $scope.main.state) {
	  console.log(now());
	  //$scope.main.streams._state.date.push([timestamp, $scope.main.state])	
		
      $scope.main.stateClass = 'label-warning';
      setTimeout(function() {
        $scope.$apply(function() {
          $scope.main.stateClass = 'label-info';
        });
      }, 800);
    
	  $scope.main.properties.diff.raw = jsondiffpatch.diff(
      $scope.main.properties.old, $scope.main.properties.raw);

      $scope.main.properties.diff.html = jsondiffpatch.formatters.html.format(
      $scope.main.properties.diff.raw, $scope.main.properties.raw);

      $scope.formattedDiff = $sce.trustAsHtml($scope.main.properties.diff.html);

      clearTimeout($scope.main.properties.clearHighlight);

      $scope.main.properties.clearHighlight = setTimeout(function(){
        $scope.$apply(function(){
          $scope.formattedDiff = $sce.trustAsHtml($scope.main.properties.text);
        });
      }, 1500);
    }
	  
    if (data.entities) {
      angular.forEach(data.entities, function(entity) {
		entity.raw = entity.properties;
        entity.properties = JSON.stringify(entity.properties, null, 2);
        var heading = [];
		
		if(entity.raw.name && entity.raw.name.length > 0){
			entity.heading = entity.raw.name;
		}else{
			if (entity.class) {
			  heading.push('class: ' + JSON.stringify(entity.class));
			}

			if (entity.rel) {
			  heading.push('rel: ' + JSON.stringify(entity.rel));
			}

			entity.heading = heading.join(', ') || '[unknown class]';
		
		}

        if (entity.links) {
          var links = [];
          angular.forEach(entity.links, function(link) {
            angular.forEach(link.rel, function(rel) {
			  if(rel == "self"){ entity.selfLink = { rel: rel, href: link.href }; }
              links.push({ rel: rel, href: link.href });
            });
          });

          entity.links = links;
		  entity.manyLinks = entity.links.length > 1;
        }

        $scope.main.entities.push(entity);
      });
    }

    if (data.links) {
      angular.forEach(data.links, function(link) {
        angular.forEach(link.rel, function(rel) {
          $scope.main.links.push({ rel: rel, href: link.href });
        });
      });
    }

    if($scope.url){		  
      var protocol = $scope.url.split("//");
      var _crumbs = protocol[1].split("/");

      $scope.main.breadcrumbs = [];

      for(var i = 1; i < _crumbs.length; i++){
        var url = protocol[0] + "//";
        for(var a = 0; a < i; a++){
          url += _crumbs[a] + "/";
        }

        $scope.main.breadcrumbs.push({
          "text": _crumbs[i],
          "href": url + _crumbs[i]
        });
      }
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
