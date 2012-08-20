var Proxy = require('nginx-http-proxy');

function NginxProxyConfigurer(config, instance) {
    
    if (!config || !config.nginx) {
        throw new Error('No nginx path available. Add nginx to steelmesh configuration');
    }
    
    if (!instance) {
        throw new Error('No instance provided - proxy returning');
    }
    
    this.nginx = new Proxy(config.nginx);
    this.config = config;
    
    instance.on('message.steelmesh.client.up', function(message, handle) {
        console.log('Registering new application instance with nginx');
        
        instance.on('exit', function() {
            console.log('Removing application instance from nginx');
        })
    });
    
}

// Export the plugin
module.exports = function(config, instance) {
    return new NginxProxyConfigurer(config, instance);
}