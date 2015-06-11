if (Meteor.isServer)
  var Future = Npm.require('fibers/future');

angular.module('angular-meteor')
  .provider('ServerAPI', function() {
    var serverAPIs = [];
    return {
      register : function(apis) {
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
    Meteor.methods({
      'angular:service' : function(name, prop, args) {
        var service = $injector.get(name);
        var result;

        // XXX - think if better to apply with meteor's this or the service
        if (Meteor.isClient && angular.isDefined(service.$$originalInstance)) {
          result = service.$$originalInstance[prop].apply(this, args);
        }
        else {
          result = service[prop].apply(this, args);
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
  }]);
