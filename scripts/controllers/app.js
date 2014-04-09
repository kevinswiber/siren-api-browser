'use strict';

/* Controllers */

var sirenAppController = angular.module('sirenAppController', []);

sirenAppController.controller('AppCtrl', [
  '$scope'
  , '$sce'
  , '$state'
  , '$http'
  , '$location'
  , 'navigator'
  , 'getStreams'
  , function($scope, $sce, $state, $http, $location, navigator, getStreams) {
  $scope.init = function() {
    var params = $state.params;
    var rootUrl = params.url;

    follow(rootUrl);
    $scope.logger('ws://localhost:3000/events');
  };

  $scope.execute = function(stream) {
    var action = stream.action;
    
    // Subscribe to any events that need it via websockets
    if (action.class && action.class.indexOf('event-subscription') !== -1) {
      var ws = new WebSocket(action.href);
		
      console.log('new web socket');
      //when there's a stream message	
      ws.onmessage = function(event) {
        //Add data to model w/ timestamp here
        var d = JSON.parse(event.data);
        //console.log(d);

        var update = {
          target: d.destination.replace(/\//g, '_'),
          data: d.data
        }  
        //console.log($scope);  
          
        //console.log('pushing data:', update);
        stream.data.push([new Date(), update.data]);	  

        if(stream.data.length > 75){
          stream.data.shift();
        }

        $scope.$apply();
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
      // Instead of throwing all kinds of errors
      if (result.noop) {
        return;
      }
		
      
      $scope.formattedDiff = "";
      
      $scope.main = {
        class: null,
        actions: [],
        entities: [],
        links: [],
        breadcrumbs: []
      }
      

      console.log("main scope from navigator.exec: ", $scope.main);
      
      $scope.url, $state.params.url = result.config.url;

      showData(result.data);
    });
  };

  $scope.logger = function(url){
    
    var ws = new WebSocket(url);
    
    //when there's a stream message	
    ws.onmessage = function(event) {
      //Add data to model w/ timestamp here
      var d = JSON.parse(event.data);
      console.log(d);
      if (d.destination === '_logs') {
        // visualize state transition
        angular.forEach($scope.main.entities, function(e) {
          if (e.raw.name === d.data.properties.name) {
            e.raw.state = d.data.properties.state;
          }
        });
      }
    }

    var command = { cmd: "subscribe", name: "_logs" };
    
    ws.onopen = function(event) {
      ws.send(JSON.stringify(command));
    };
  };

  var follow = function(rootUrl) {
    var url = rootUrl;

    $scope.main = {
      properties: [],
      entities: [],
      links: []
    };

    $scope.isOneAtATime = true;
    $scope.url = url;

    $state.params.url = url;

    console.log(url);
    console.log($state.params);
    navigator.fetch(url, $state.params).then(function(data) {
      console.log($scope.main, data);
      showData(data);
    });
  };

  var showData = function(data) {
    //parse it if you got it!
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
	 
    //sort the data! This should be done on the api or UNDONE in jsondiff formatters.js
    //This is all for displaying the properties array in the json diff object
	  var tosort = []
	  angular.forEach(data.properties, function(prop, i){ tosort.push(i); });
	  tosort.sort();
	  
	  data.abc_properties = {};
	  angular.forEach(tosort, function(key){
	  	data.abc_properties[key] = data.properties[key];
	  });
	  
    $scope.main.properties.old = $scope.main.properties.raw;
    $scope.main.properties.text = "<pre>" + JSON.stringify(data.abc_properties, null, 2).replace(/\"([^(\")"]+)\":/g,"$1:") + "</pre>"; //regex to remove quotes (") from stringify
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

//can we do realtime state on homepage? 
    
    // Rebuild as a service? 
    
    if (data.entities) {
      angular.forEach(data.entities, function(entity) {
        entity.streams = {};
        entity.totalStreams = 0;
        entity.streamsArray = [];
        entity.raw = entity.properties;
        entity.properties = JSON.stringify(entity.properties, null, 2);
        var heading = [];
		
        if (entity.raw.name && entity.raw.name.length > 0) {
          entity.heading = entity.raw.name;
        } else {
          if (entity.class) {
            heading.push('class: ' + JSON.stringify(entity.class));
          }

          if (entity.rel) {
            heading.push('rel: ' + JSON.stringify(entity.rel));
          }

          entity.heading = heading.join(', ') || '[unknown class]';
        
        }


          var links = [];
          angular.forEach(entity.links, function(link) {
            angular.forEach(link.rel, function(rel) {
              //Find the self link in the hypermedia response
              if(rel == "self") {
                entity.selfLink = { rel: rel, href: link.href };
                //Get any streams
                var streams = getStreams.atURL(link.href);
                streams.then(function(stream){
                  angular.forEach(stream.streams, function(s){
                    $scope.execute(s);
                  });

                  //entity.streams = stream.streams;

                  Object.keys(stream.streams).forEach(function(key) {
                    entity.streams[key] = stream.streams[key];
                  });
                  //console.log('entity.streams:', entity.streams);
                  entity.totalStreams = stream.totalStreams;
                });
                
              }

              links.push({ rel: rel, href: link.href });
            });
          });

          //Save the discovered links 
          entity.links = links;
          entity.manyLinks = entity.links.length > 1;
          
          //Add the entity to the controller scope
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

} //.controller anonymous function

]); //closure for .controller

