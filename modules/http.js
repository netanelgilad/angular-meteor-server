var url = Npm.require('url');
var http = Npm.require('http');

angular.module('ng').config(['$provide', function($provide) {
  $provide.decorator('$httpBackend', function() {
    // TODO : handle timeout
    return function(method, targetUrl, post, callback, headers, timeout, withCredentials, responseType) {
      // TODO: handle no url
      targetUrl = targetUrl || 'localhost';

      var parsedUrl = url.parse(targetUrl);

      var requestOptions = {
        hostname : parsedUrl.hostname,
        port : parsedUrl.port,
        path : parsedUrl.pathname,
        method : method,
        headers : headers,
      };

      var req = http.request(requestOptions, Meteor.bindEnvironment(function(res) {
        res.setEncoding('utf8');
        var response = '';
        res.on('data', Meteor.bindEnvironment(function (chunk) {
          response += chunk;
        }));
        res.on('end', Meteor.bindEnvironment(function() {
          callback(res.statusCode, response, res.headers, res.statusMessage || '');
        }));
      }));

      req.on('error', Meteor.bindEnvironment(function(e) {
        callback(-1, null, null, '');
      }));

      // write data to request body
      if (post)
        req.write(post);

      req.end();
    };
  });
}]);