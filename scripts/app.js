angular
  .module('surface', ['siren', 'ui.state', 'ui.bootstrap'])
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
      ['$scope', '$state', '$http', '$location', 'navigator', SurfaceCtrls.EntityCtrl])
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
  .filter('breadcrumb', function(){
		return function(url){
			//break up the url
			var protocol = url.split("//");
			var _crumbs = protocol[1].split("/");
			var crumbs = [];
			
			//create a verbose representation of the breadcrumbs
			for(var i = 0; i < _crumbs.length; i++){
				var url = protocol[0] + "//";
				for(var a = 0; a < i; a++){
					url += _crumbs[a] + "/";
				}
				
				//that url should not be hardcoded here - maybe in angular?
				crumbs[i] = {
					"text": _crumbs[i],
					"url": "/#/entity?url=" + encodeURI(url + _crumbs[i])
				}
			}
			
			/* 
				there's an "angular-y" way to do this, I just don't know what that is -Alan
				Something along the lines of this example:
					http://jsfiddle.net/api/post/library/pure/
			*/
			$("#breadcrumbs").empty();
			var output = $("<ol>").addClass("breadcrumb");
			for(var i = 0; i < crumbs.length; i++){
				if(i == crumbs.length -1){
					$("<li>")
						.html(crumbs[i].text)
						.addClass('active')
						.appendTo(output);
				}else {
					$("<li>")
						.append($("<a>")
								.attr('href', crumbs[i].url)
								.html(crumbs[i].text))
						.appendTo(output);
				}
			}
			$("#breadcrumbs").append(output);
			//obviously a hack
			return "";
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
