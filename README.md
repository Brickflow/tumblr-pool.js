
## tumblr-pool.js

tumblr-pool.js is a tumblr.js wrapper, which accepts multiple access tokens and uses them.

### Usage

var t = tumblr.createClient({
  consumer_key: '...',
  consumer_secret: '...', 
  logger: { 
    info: function() { ... },
    error: function() { ... } 
  }
});

t.addClient({
  consumer_key: '...',
  consumer_secret: '...'
});

### TODO

- Should work the exact same way as tumblr.js (createClient at least)
- Multiple IP addresses (override tumblr.js request object)
