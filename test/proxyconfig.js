var ProxyConfig = require('../main'),
    expect = require('chai').expect,
    events = require('events'),
    util = require('util');

describe('Steelmesh Proxy Config tests', function() {
        
    // Test the authentication interface
    describe('can listen to events', function() {
        
        it('should load', function(done) {
            var testPort = 9999,
                instance = new MockInstance(),
                nginx = new ProxyConfig({config: {} }, {nginx: '/usr/local/nginx', path: 'mocha-test'}, instance);
            
            instance.emit('message.steelmesh.client.up', {port: testPort});
        
            nginx.on('port.added', function(port) {
                expect(port).to.equal(testPort);
                
                // Impersonate a process shutdown
                instance.emit('exit');
            });
            
            nginx.on('port.deleted', function(port) {
                expect(port).to.equal(testPort);
                done();
            });
        });
        
    });    
});

function MockInstance() {
    
}
util.inherits(MockInstance, events.EventEmitter);