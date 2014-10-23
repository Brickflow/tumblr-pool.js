
## tumblr-pool.js

tumblr-pool.js is a tumblr.js wrapper, which can be used with multiple consumer_keys 

### Usage

```javascript
// Create a client as usual, with some extra parameters you may want
var t = tumblr.createClient({
  consumer_key: '...',
  consumer_secret: '...', 
  token: '...',
  token_secret: '...',
  
  logger: { // a logger object 
    info: function() { ... },
    error: function() { ... } 
  },
  loggerEventName: 'tumblr-query',
  ip: 1.2.3.4 // optional: local IP (request.js localAddress)
});

// add another client
t.addClient({
  consumer_key: '...',
  consumer_secret: '...',
  ip: 1.2.3.4
});

t.posts('blogName', function(err, res) {});
```
