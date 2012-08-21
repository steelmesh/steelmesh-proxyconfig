var Proxy = require('nginx-http-proxy');

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
    console.log('opts');
    
    function applyUpdate(callback) {
        myself.nginx.update(function(err) {
            if (err) {
                return console.log('Update error [' + err + ']');
            }
            myself.nginx.reload(function(err) {
                if (err) {
                    return console.log('Reload error [' + err + ']');
                }
                console.log('nginx reloaded');
                callback();
            });
        });
    }
    
    instance.on('message.steelmesh.client.up', function(message, handle) {
        console.log('Registering new application instance with nginx');
        myself.nginx.add(['localhost:' + message.port], opts.path, function(err) {
            if (err) {
                return console.log(err);
            }
            applyUpdate(function() {
                instance.on('exit', function() {
                    myself.nginx.del(['localhost:' + message.port], opts.path);
                    applyUpdate();
                });
            });            
            
        });        
        
    });
    
}

// Export the plugin
module.exports = function(steelmesh, config, instance) {
    return new NginxProxyConfigurer(steelmesh, config, instance);
}