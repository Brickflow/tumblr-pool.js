'use strict';

var _ = require('jstk').bind(require('lodash'));
var tumblr = require('tumblr.js');
var roughSizeOfObject = require('./roughSizeOfObject')

module.exports = function instanceFactory(params) {
  var tumblrParams = _.pick(params,
        'consumer_key', 'consumer_secret', 'token', 'token_secret'); 
  
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
          if (!err) {
            var responseAt = new Date();
            res.logInfo = {
              tumblrKey: self.consumer_key,
              tumblrToken: self.token,
              byteSize: roughSizeOfObject(res),
              queryAt: queryAt,
              responseAt: responseAt,
              queryDuration: responseAt - queryAt, // millisec
              queryType: cmd,
              instanceQueryCount: queryCount,
            }
          }
          return callback(err, err ? null : res);
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