var MainCtrl = function($scope, $state, navigator, appState) {
  $scope.init = function() {
    $scope.params = { url: appState.url || '' };
  };

  $scope.fetchUrl = function(params) {
    // TODO: Add URL validation here.
    var url = params.url;
    appState.url = url;
    navigator.transitionTo(url, { url: url });
  };
};

