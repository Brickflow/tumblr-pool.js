/* jshint camelcase: false */
'use strict';
var _ = require('lodash');
var roughSizeOfObject = require('./roughSizeOfObject')

var tumblr = require('tumblr.js');
tumblr.request(require('./requestWrapper'));

var mainResponseArrayFields = {
  posts: ['posts', 'tagged', 'dashboard'],
  users: ['followers'],
  liked_posts: ['liked_posts']
}
function responseArrayByCommand(cmd) {
  return _.findKey({
    posts: ['posts', 'tagged', 'dashboard'],
    users: ['followers'],
    liked_posts: ['liked_posts']
  }, function(v) { 
    return _.contains(v, cmd); 
  }); 
}

module.exports = function instanceFactory(params) {
  var tumblrParams = _.pick(params,
        'consumer_key', 'consumer_secret', 'token', 'token_secret',
        'ip');
  
  var self = {    
    client: new tumblr.Client(tumblrParams),
    
    lastQueryAt: null,
    queryCount: 0,
    
    query: function() {
      var args = _.values(arguments);
      var cmd = args.shift();
      var callback = (typeof _.last(args) === 'function') ? args.pop() : _.noop;
      
      var queryAt = new Date();
      var queryCount = self.queryCount;
      
      args.push(
        function instanceResponseCallback(err, res) {
          var responseAt = new Date();
          
          res = res || {};
          res.logInfo = {
            byteSize: roughSizeOfObject(res),
            'status': 'success',            
            tumblrKey: self.consumer_key,
            tumblrToken: self.token,
            ip: self.ip,
            queryType: cmd,
            queryParams: args.slice(0, -1), // w/o the callback
            queryAt: queryAt,
            responseAt: responseAt,
            queryDuration: responseAt - queryAt, // millisec
          };
          
          var responseArrayKey = responseArrayByCommand(cmd);
          if (responseArrayKey) {
            if (res[responseArrayKey]) {
              res.logInfo.responseArrayCount = res[responseArrayKey].length;
            }
          }
          
          if (err) {
            res.logInfo = _.assign(res.logInfo, {
              'status': 'error',
              err: err,
              stack: err.stack,
              code: err.code
            });
          }
          
          
          return callback(err, res);
        });
      
      self.queryCount++;
      self.lastQueryAt = new Date();
      self.client[cmd].apply(self.client, args);
    }
  };
  
  _.each(tumblrParams, function(v, k) {
    self[k] = v;
  });
  
  return self;
};