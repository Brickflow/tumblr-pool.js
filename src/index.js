/* jshint camelcase: false */
'use strict';

var _ = require('jstk').bind(require('lodash'));
var instanceFactory = require('./instanceFactory');
var loggerEventName = 'tumblr-query';
var request = require('request');

var tumblrPoolFactory = function tumblrPoolFactory(firstClientParams) {
  firstClientParams = firstClientParams || {}; 
  if (firstClientParams.loggerEventName) {
    loggerEventName = firstClientParams.loggerEventName;
  }
  var self = {
    logger: firstClientParams.logger,
    pool: [],
    loopCounter: 0,
    
    // adds a new client to the pool:
    addClient: function addClient(params) {
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
        for (var key in instance.client) {
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
      args.push(function instanceCallbackWrapper(err, res) {
        if (self.logger) {
          if (err || res.logInfo.status !== 'success') {
            self.logger.info(loggerEventName, res.logInfo); 
          } else {
            self.logger.error(loggerEventName, res.logInfo);
          }
        }
        cb(err, res);
      });
      
      self.pool[self.loopCounter].query.apply(null, args);
      self.loopCounter = (self.loopCounter + 1) % self.pool.length;
    }
    
  };
  
  self.addClient(firstClientParams);
  
  return self;
  
};

tumblrPoolFactory.createClient = function() {
  return tumblrPoolFactory.apply(null, arguments);
}

module.exports = tumblrPoolFactory;