window.name = 'NG_DEFER_BOOTSTRAP!';

let modules = [];

modules.push(['$provide', '$injector', function($provide, $injector) {
  angular.forEach(Meteor.settings.public['netanelgilad:angular-server'], (funcDefs, name) => {
    if ($injector.has(name)) {
      $provide.decorator(name, ['$delegate', '$q', function($delegate, $q) {
        let serviceInstance = {};
        angular.forEach(funcDefs, function (funcDef) {
          serviceInstance[funcDef] = function (...args) {
            let deferred = $q.defer();
            let methodName = 'angular:' + name + '/' + funcDef;

            Meteor.call(methodName, ...args, (err, data) => {
              if (err)
                deferred.reject(err);
              else
                deferred.resolve(data);
            });

            return deferred.promise;
          };
        });

        serviceInstance.$$originalInstance = $delegate;

        return serviceInstance;
      }]);
    }
    else {
      $provide.factory(name, ['$q', function ($q) {
        var serviceInstance = {};
        angular.forEach(funcDefs, function (funcDef) {
          serviceInstance[funcDef] = function (...args) {
            var deferred = $q.defer();
            let methodName = 'angular:' + name + '/' + funcDef;

            Meteor.call(methodName, ...args, (err, data) => {
              if (err)
                deferred.reject(err);
              else
                deferred.resolve(data);
            });

            return deferred.promise;
          };
        });

        return serviceInstance;
      }]);
    }
  });
}]);

// XXX make sure resumeBootstrap is defined before calling it
(function resume() {
  setTimeout(function () {
    if (!angular.resumeBootstrap) {
      resume();
    }
    else {
      angular.resumeBootstrap(modules);
    }
  }, 1);
})();