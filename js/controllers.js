app

.controller('AppCtrl', function($scope, $rootScope, api, $state) {
  $rootScope.errorMessage = "Unknown"
  $rootScope.hideStatusHeader = $state.current.name === "app.settings";
  if (!$rootScope.items) $rootScope.items = {};
  api.setKey(localStorage.apiKey);
  api.setUrl(localStorage.ip);
  api.init();
  var state;

  $scope.job = api.job;

  api.get("job").then(function (data) {
    if (data.status === 200){
      $rootScope.items.job = data.data.job
      $rootScope.items.progress = data.data.progress
    }
  });

  $rootScope.$on('error::connection', function () {
    $rootScope.error = true;
    $rootScope.errorMessage = "Cannot connect to server";
  });

  $rootScope.$on('error::auth', function () {
    $rootScope.error = true;
    $rootScope.errorMessage = "Not a valid API key";
  });

  $rootScope.$on('error::auth', function () {
    $rootScope.error = true;
    $rootScope.errorMessage = "Not a valid API key";
  });

  $rootScope.$on('error::url', function () {
    $rootScope.error = true;
    $rootScope.errorMessage = "Missing sever address or the sever address is not vaild";
  });

  $rootScope.retry = function () {
    api.init();
  }

  $rootScope.cancel = function () {
    $rootScope.cancelRetry = true;
    $rootScope.lostConn = false;
    $rootScope.error = true;
    $rootScope.errorMessage = "Cannot connect to server";
  }

  $rootScope.$on('$stateChangeSuccess', function (ev, state) {
    $rootScope.hideStatusHeader = state.name === "app.settings";
    state = state.name;
  })

  $rootScope.log = "";
  $rootScope.$on("socket::onmessage", function(eve, data) {
    console.log(data)
      if (data.current || data.history){
        var d;
        d = data.history ? "history": "current";
        data[d].logs.forEach(function (log) {
          $rootScope.log += "> " + log + "\n"
        })
        if (data[d].temps.length != 0) $rootScope.items.temperature = data[d].temps[data[d].temps.length-1];
        $rootScope.items.state = data[d].state
        $rootScope.items.job = data[d].job
        $rootScope.items.progress = data[d].progress
        $rootScope.$apply();
  //TODO      if (state === "app.terminal")  document.getElementById("terminal").scrollTop = document.getElementById("terminal").scrollHeight
      }
  });

})

.controller('StatusCtrl', function($scope, $rootScope, api) {
  api.get("printer").then(function (data) {
    if (data.status === 200){
      $rootScope.items.temperature = data.data.temperature
      $rootScope.items.state = data.data.state
    }
  });
})

.controller('PlaylistCtrl', function($scope, $rootScope, $stateParams) {
})

.controller('TerminalCtrl', function($scope, $rootScope, api) {


})


.controller('TempCtrl', function($scope, $rootScope, api) {
  $scope.isModifying = {bed:false, tool0:false}
  $scope.temp = {};
  $rootScope.$on("socket::onmessage", function(eve, data) {
    if (data.current || data.history){
      var d;
      d = data.history ? "history": "current";
      if (data[d].temps.length != 0 && !$scope.isModifying.tool0) $scope.temp.tool0 = data[d].temps[data[d].temps.length-1].tool0;
      if (data[d].temps.length != 0 && !$scope.isModifying.bed) $scope.temp.bed = data[d].temps[data[d].temps.length-1].bed;
  }
  })

  $scope.setBedTemp = function (temp) {
    $scope.isModifying.bed = false;
    api.printer.bed(temp);
  }
  $scope.setToolTemp = function (tool, temp) {
    $scope.isModifying[tool] = false;
    api.printer.toolTemp(tool, temp);
  }
})

.controller('ConnectionsCtrl', function($scope, $rootScope, api) {
  api.get("connection").then(function (data) {
    if (data.status === 200){
      $rootScope.items.connections = data.data;
    }
  })
})

.controller('ControlsCtrl', function($scope, $rootScope, api) {
  $scope.move = function (axis, back) {
    var data = {}
    data[axis] = back ? -$scope.amountMove : $scope.amountMove
    api.printhead.jog(data)
  }
  $scope.home = function (z) {
    var data = z ? {axes: ["z"]} : {axes: ["x", "y"]}
    api.printhead.home(data)
  }
  $scope.ext = function (amount) {
    api.printer.toolExt('tool0', amount);
  }
  $scope.setAmoutMove = function (a) {
    $scope.amountMove = a;
  }
})

.controller('FilesCtrl', function($scope, $rootScope, api) {
  api.get("files").then(function (data) {
    if (data.status === 200){
      $rootScope.items.files = data.data.files;
    }
  })
})

.controller('SettingsCtrl', function($scope) {

  if (localStorage.apiKey) $scope.apiKey = localStorage.apiKey;
  if (localStorage.ip) $scope.ip = localStorage.ip;

  $scope.save = function (s, i) {
    localStorage[s] = i;
  }

})

;
