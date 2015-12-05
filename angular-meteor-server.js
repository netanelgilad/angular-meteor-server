let settings = Meteor.settings.public['netanelgilad:angular-server'] = {};

angular.module('angular-meteor', [])
  .run(['ServerAPI', '$injector', function(ServerAPI, $injector) {
    angular.forEach(ServerAPI.getServerAPIS(), function(api) {
      let instance = $injector.get(api);
      let funcDefs = [];
      for (var key in instance) {
        if (angular.isFunction(instance[key])) {
          funcDefs.push(key);
        }
      }
      settings[api] = funcDefs;
    });
  }]);
