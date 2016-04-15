if (Meteor.isServer)
  var Future = Npm.require('fibers/future');

angular.module('angular-meteor')
  .provider('ServerAPI', function() {
    var serverAPIs = [];
    return {
      register : function(...apis) {
        serverAPIs = serverAPIs.concat(apis);
      },
      $get : function() {
        return {
          getServerAPIS : function() {
            return serverAPIs;
          }
        };
      }
    }
  })
  .run(['$injector', '$q', function($injector, $q) {
    let methods = {};

    angular.forEach(Meteor.settings.public['netanelgilad:angular-server'], (funcDefs, name) => {
      angular.forEach(funcDefs, (func) => {
        let methodName = 'angular:' + name + '/' + func;

        methods[methodName] = function(...args) {
          var service = $injector.get(name);
          var result;

          // XXX - think if better to apply with meteor's this or the service
          if (Meteor.isClient && angular.isDefined(service.$$originalInstance)) {
            result = service.$$originalInstance[func].apply(this, args);
          }
          else {
            result = service[func].apply(this, args);
          }

          if (Meteor.isServer) {
            var futureResponse = new Future();
            $q.when(result).then(function(returnValue) {
              futureResponse.return(returnValue);
            }, function(error) {
              futureResponse.throw(new Meteor.Error('angular:service', 'Promise Rejected', error));
            });

            return futureResponse.wait();
          }
          else {
            return result;
          }
        }
      });
    });

    /**
     * Make angular-server testable. When angular is setup again and again by unit or integration tests
     * Meteor.methods() is called again and again with the same method object map. The current Meteor version throws
     * an exception if a method is registered to Meteor.methods() more than once with the same method name. So this
     * patch calls Meteor.methods() only with the method names the have not been registered before.
     */
    let registeredMethods = {};
    let unregisteredMethods = {};

    if (Meteor.isServer) {
      registeredMethods = Meteor.server.method_handlers;
    }
    if (Meteor.isClient) {
        registeredMethods = Meteor.connection._methodHandlers;
    }

    angular.forEach(methods, function(funcDef, name) {
      if (registeredMethods[name] === undefined) {
        unregisteredMethods[name] = funcDef;
      }
    });

    Meteor.methods(unregisteredMethods);
  }]);
