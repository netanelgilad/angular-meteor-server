var serverInstances = new Meteor.Collection(null);

angular.module('angular-meteor', [])
  .run(['ServerAPI', '$injector', function(ServerAPI, $injector) {
    angular.forEach(ServerAPI.getServerAPIS(), function(api) {
      var instance = $injector.get(api);
      var funcDefs = [];
      for (var key in instance) {
        if (angular.isFunction(instance[key])) {
          funcDefs.push(key);
        }
      }
      serverInstances.insert({ name : api, funcDefs : funcDefs });
    });
  }])
  .run(function() {
    Meteor.publish('serverInstances', function() {
      var self = this;
      var handle = serverInstances.find({}).observeChanges({
        addedBefore: function (id, fields) {
          self.added('serverInstances', id, fields);
        },
        changed: function (id, fields) {
          self.changed('serverInstances', id, fields);
        },
        removed: function (id) {
          self.removed('serverInstances', id);
        }
      });

      self.ready();

      self.onStop(function() {
        handle.stop();
      })
    });
  });
