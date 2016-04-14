var app = angular.module('octoctrl', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })


  .state('app.status', {
      url: '/status',
      views: {
        'menuContent': {
          templateUrl: 'templates/status.html',
          controller: 'StatusCtrl'
        }
      }
    })
    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })

  .state('app.temp', {
    url: '/temperature',
    views: {
      'menuContent': {
        templateUrl: 'templates/temp.html',
        controller: 'TempCtrl'
      }
    }
  })

  .state('app.controls', {
    url: '/controls',
    views: {
      'menuContent': {
        templateUrl: 'templates/controls.html',
        controller: 'ControlsCtrl'
      }
    }
  })
  .state('app.files', {
    url: '/files',
    views: {
      'menuContent': {
        templateUrl: 'templates/files.html',
        controller: 'FilesCtrl'
      }
    }
  })
  .state('app.connections', {
    url: '/connections',
    views: {
      'menuContent': {
        templateUrl: 'templates/connections.html',
        controller: 'ConnectionsCtrl'
      }
    }
  })
  .state('app.commands', {
    url: '/commands',
    views: {
      'menuContent': {
        templateUrl: 'templates/commands.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.terminal', {
    url: '/terminal',
    views: {
      'menuContent': {
        templateUrl: 'templates/terminal.html',
        controller: 'TerminalCtrl'
      }
    }
  })

  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/status');
});
