angular.module('ng').config(['$provide', function($provide) {
  $provide.decorator('$httpBackend', function() {
    return function(method, targetUrl, post, callback, headers, timeout) {
      targetUrl = targetUrl || Meteor.absoluteUrl();

      HTTP.call(method, targetUrl, {
        content : post,
        headers : headers,
        timeout : timeout
      }, (err, result) => {
        if (err) {
          callback(-1, null, null, '');
        }
        else {
          callback(result.statusCode, result.data || result.content, result.headers, '');
        }
      });
    };
  });
}]);