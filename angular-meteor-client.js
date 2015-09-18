var serverInstances = new Meteor.Collection('serverInstances');

window.name = 'NG_DEFER_BOOTSTRAP!';

Meteor.subscribe('serverInstances', function () {
  var modules = [];

  serverInstances.find({}).forEach(function (instance) {
    'use strict';
    modules.push(['$provide', '$injector', function ($provide, $injector) {
      if ($injector.has(instance.name)) {
        $provide.decorator(instance.name, ['$delegate', '$q', function($delegate, $q) {
          var serviceInstance = {};
          angular.forEach(instance.funcDefs, function (funcDef) {
            serviceInstance[funcDef] = function () {
              var args = Array.prototype.slice.call(arguments);

              var deferred = $q.defer();

              Meteor.call.apply(this, [
                'angular:service',
                instance.name,
                funcDef,
                args,
                function (err, data) {
                  if (err)
                    deferred.reject(err);
                  else
                    deferred.resolve(data);
                }
              ]);

              return deferred.promise;
            };
          });

          serviceInstance.$$originalInstance = $delegate;

          return serviceInstance;
        }]);
      }
      else {
        $provide.factory(instance.name, ['$q', function ($q) {
          var serviceInstance = {};
          angular.forEach(instance.funcDefs, function (funcDef) {
            serviceInstance[funcDef] = function () {
              var deferred = $q.defer();

              var args = Array.prototype.slice.call(arguments);

              Meteor.call.apply(this, [
                'angular:service',
                instance.name,
                funcDef,
                args,
                function (err, data) {
                  if (err)
                    deferred.reject(err);
                  else
                    deferred.resolve(data);
                }
              ]);

              return deferred.promise;
            };
          });

          return serviceInstance;
        }]);
      }
    }]);
  });

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
});
