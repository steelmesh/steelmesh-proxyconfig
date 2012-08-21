var ProxyConfig = require('../main'),
    events = require('events'),
    util = require('util');

describe('Steelmesh Proxy Config tests', function() {
        
    // Test the authentication interface
    describe('can listen to events', function() {
        
        it('should load', function(done) {
            var instance = new MockInstance(),
                nginx = new ProxyConfig({config: {} }, {nginx: '/usr/local/nginx', path: 'mocha-test'}, instance);
            
            instance.emit('message.steelmesh.client.up', {port: 9999});
        
        });
        
    });    
});

function MockInstance() {
    
}
util.inherits(MockInstance, events.EventEmitter);