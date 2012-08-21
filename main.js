var debug = require('debug')('steelmesh-proxyconfig'),
    util = require('util'),
    events = require('events'),
    Proxy = require('nginx-http-proxy');

function NginxProxyConfigurer(steelmesh, opts, instance) {
    
    opts = opts || {};
    var nginx = opts.nginx || steelmesh.config.nginx,
        myself = this;
    if (!nginx) {
        throw new Error('No nginx path available. Add nginx to steelmesh configuration');
    }
    
    if (!instance) {
        throw new Error('No instance provided - proxy returning');
    }
    
    this.nginx = new Proxy(nginx);
    this.ports = [];
    
    // Applies the nginx updates that have occurred
    function applyUpdate(callback) {
        
        // Write the nginx config updates
        myself.nginx.update(function(err) {
            if (err) {
                debug('Update error [' + err + ']');
                callback && callback.call(myself, arguments);
            }
            
            // Reload the nginx configuration
            myself.nginx.reload(function(err) {
                if (err) {
                    debug('Reload error [' + err + ']');
                }
                callback && callback.call(myself, arguments);                
            });
        });
    }
    
    // Receive a message from steelmesh
    instance.on('message.steelmesh.client.up', function(message, handle) {
        
        var port = message.port;
        
        debug('Adding ' + port + ' for ' + opts.path);
        
        myself.nginx.add(['localhost:' + port], opts.path, function(err) {
            if (err) {
                return console.log(err);
            }
            // Apply the update
            applyUpdate(function() {                                                
                
                function deletePort() {
                    debug('Remvoing ' + port + ' for ' + opts.path);
                    myself.nginx.del(['localhost:' + port], opts.path);
                    myself.emit('port.deleted', port);
                    applyUpdate();
                }
                
                // Remove the port
                instance.on('exit', deletePort);
                instance.on('shutdown', deletePort);
                
                myself.emit('port.added', port);
            });            
            
        });        
        
    });
    
    debug('Nginx proxy configuration ready');
    
}
util.inherits(NginxProxyConfigurer, events.EventEmitter);

// Export the plugin
module.exports = function(steelmesh, config, instance) {
    return new NginxProxyConfigurer(steelmesh, config, instance);
}