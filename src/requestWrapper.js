var request = require('request');
var _ = require('lodash');

var requestWrapper = function requestWrapper(kind, params, cb) {
  if (params.oauth && params.oauth.ip) {
    params.localAddress = params.oauth.ip;
    delete params.oauth.ip;
  }
  return request[kind](params, cb);
}

module.exports = {
  get: _.partial(requestWrapper, 'get'),
  post: _.partial(requestWrapper, 'post')
}