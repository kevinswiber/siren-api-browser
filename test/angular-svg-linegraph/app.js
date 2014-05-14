angular.element(document).ready(function() {
  var app = angular.module('angularSVG', []);
  
	app.controller('MainCtrl', function($scope) {
		$scope.graph = {'width': 200, 'height': 30};
        
        var p = [];
        for(i=0; i<40; i++){
          p.push({
            'x': i,
            'y': Math.floor((Math.random()*100)+1) 
          });
        }
        var index = 40;

        var update = setInterval(function(){
          p.push({
              'x': index,
              'y': Math.floor((Math.random()*100)+1) 
            });
          p.shift();
          index++;



          $scope.points = p;
        
          console.log($scope.points);

          x = d3.time.scale().range([0, $scope.graph.width]);
          y = d3.scale.linear().range([$scope.graph.height, 0]);

          x.domain(d3.extent($scope.points, function(d) {return d.x}));
          y.domain(d3.extent($scope.points, function(d) {return d.y}));

          $scope.line = d3.svg.line()
              .x(function(d) {return x(d.x);})
              .y(function(d) {return y(d.y);});
          
          $scope.$apply();
        }, 100);
		

	});

	angular.bootstrap(document, ['angularSVG']);
});