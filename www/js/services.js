app.service("api", function($rootScope, $http) {
  var socket;
  var wait = false;
  var self = this;
  var timeTried = 0;
  var socketConnected = false;

  // localStorage is handled by octoctrl service
  this.setKey = function(key) {
    $http.defaults.headers.common["X-Api-Key"] = key;
  };

  this.setUrl = function(url) {
    if (!url && url != "") return false;
    // Use http by default if not else is provided
    if (url.startsWith("http://") || url.startsWith("https://")) $rootScope.url = url;
    else $rootScope.url = "http://"+url
  };

  // This is the Init function that will keep the connection between client and server active at all time, if else broadcast error
  this.init = function () {
    $rootScope.connecting = true;
    $rootScope.error = false;
    self.connectionCheck(function (error) {
      if (!error) self.socketConnect();
    });
  }

  // General response check
  var responseCheckSuccess = function (data) {
    if (data.status === 200 || data.status === 204) { $rootScope.connectionError = false; data.error = false; return data; };
    return responseCheckError(data)
  }

  var pingPong = function () {
    if ($rootScope.cancelRetry){
      $rootScope.cancelRetry = false;
      return;
    }
    self.get("version").then(function (data) {
      if (data.status === 200) {
        if (socketConnected) $rootScope.connected = true;
        else self.socketConnect();
        $rootScope.lostConn = false;
        $rootScope.error = false;
        setTimeout(pingPong, 10000);
        return;
      }
      $rootScope.connected = false;
      if (data.status === 401) { $rootScope.$broadcast("error::auth"); return; }
      $rootScope.lostConn = true;
      setTimeout(pingPong, 5000);
    }, function (data) {
      $rootScope.connected = false;
      if (data.status === 401) { $rootScope.$broadcast("error::auth"); return; }
      $rootScope.lostConn = true;
      setTimeout(pingPong, 5000);
    });
  }

  var responseCheckError = function (data) {
    data.error = true;
    $rootScope.connecting = false;
    if (data.status === 401) { $rootScope.$broadcast("error::auth"); return data; }
    console.log("connection or auth error");
    $rootScope.$broadcast("error::connection");
    return data;
  }

  // Check connection between client and server
  this.connectionCheck = function (callback) {
    // Check if url is valid
    if (!$rootScope.url && typeof $rootScope.url !== "string"){
      $rootScope.$broadcast("error::");
      return;
    }
    // Check if server is live
    self.get("version").then(responseCheckSuccess, responseCheckError).then(function (data) {
      if (!data.error) callback(false);
      callback(true);
      return;
    });
  }

  // If we loose connection
  this.retryConnection = function () {
    // Let's do a connection check again
    self.connectionCheck(function (error) {
      if (!error) {
        // If not tried alredy, let's try to reconnect
        if (!wait) {
          wait = true;
          self.socketConnect()
        }else{
          if (timeTried > 3) return;
          wait = false;
          setTimeout(retryConnection, 5000);
          timeTried++
        }
      }
    })
  }

  //Socket
  this.socketConnect = function(reconnect) {

    if (!$rootScope.connected) {
      $rootScope.connecting = true;
      Socket = new SockJS($rootScope.url + "sockjs");
      Socket.onopen = function() {
        console.log('socked connection open');
        pingPong();
        $rootScope.connecting = false;
        $rootScope.connected = true;
        timeTried = 0;
        socketConnected = true;
      };
      Socket.onmessage = function(e) {
        $rootScope.$broadcast("socket::onmessage", e.data);
      };
      Socket.onclose = function() {
        console.log("connection closed, let's reconnect");
        $rootScope.connected = false;
        socketConnected = false;
        self.retryConnection();
      };
    }
  };

  //HTTP get, also a fallback if socket fails
  this.get = function(what) {
    return $http.get($rootScope.url + "/api/" + what)
  };

  // HTTP post
  this.job = function(command) {
    $http.post($rootScope.url + "/api/job", {
      command: command
    })
  };

  this.printer = {
    bed: function(temp) {
      if (typeof temp != "number") temp = parseInt(temp);
      $http.post($rootScope.url + "api/printer/bed", {
        command: "target",
        target: temp
      });
    },
    toolTemp: function(tool, temp) {
      if (typeof temp != "number") temp = parseInt(temp);
      var targets = {};
      targets[tool] = temp;
      $http.post($rootScope.url + "api/printer/tool", {
        command: "target",
        targets: targets
      });
    },
    toolExt: function(tool, mm) {
      $http.post($rootScope.url + "api/printer/tool", {
        command: "extrude",
        amount: mm
      });
    }
  };

  //TODO: add check
  this.printhead = {
    jog: function(axis) {
      console.log(axis)
      axis.command = "jog";
      $http.post($rootScope.url + "/api/printer/printhead", axis);
    },
    home: function(axis) {
      axis.command = "home";
      $http.post($rootScope.url + "/api/printer/printhead", axis);
    }
  };

});

app.filter('secondsToDateTime', [function() {
  return function(seconds) {
    return new Date(1970, 0, 1).setSeconds(seconds);
  };
}]);

app.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  }
});
