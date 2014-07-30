/* jshint camelcase: false */
'use strict';

var _ = require('jstk').bind(require('lodash'));
var instanceFactory = require('./instanceFactory');

module.exports = function tumblrPoolFactory(logger) {
  var self = {
    logger: logger,
    pool: [],
    loopCounter: 0,
    
    // adds a new client to the pool:
    createClient: function createClient(params) {
      params = params || {};
    
      // client should only instantiate once:
      var existing = _.find(self.pool, {
        consumer_key: params.consumer_key,
        token:        params.token
      });
      if (existing && existing.length > 0) {
        return existing[0];
      }
    
      // instance creation: 
      var instance = instanceFactory(params);
      self.pool.push(instance);
    
      // tumblr.js aliases (self.posts, self.tagged, ...);
      if (self.pool.length === 1) {
        for(var key in instance.client) {
          if (typeof instance.client[key] === 'function') {
            self[key] = _.partial(self.query, key);
          }
        }
      }
      return instance;
    },
    
    query: function() {
      var args = _.values(arguments);
      var cb = _.noop;
      if (typeof _.last(arguments) === 'function') {
        cb = args.pop();
      }
      args.push(function(err, res) {
        cb(err, res);
      })
      
      self.pool[self.loopCounter].query.apply(null, args);
      self.loopCounter = (self.loopCounter + 1) % self.pool.length;
    }
    
  };
  
  return self;
  
};