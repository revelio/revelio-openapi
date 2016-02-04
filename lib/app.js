var parser = require("swagger-parser")
var Promise = require("bluebird")
var publisher = require("revelio-publisher")
var endpointFactory = require("./endpointFactory")

function publish(config) {
    
    var endpointCount;
    
    return parser.validate(config.target)
        .then(buildEndpoints)
        .then(function (endpoints) {
            if (endpoints.length == 0) {
                throw new Error("No endpoints detected")
            }
            
            endpointCount = endpoints.length
            
            return endpoints;
        })
        .then(publishEndpoints)
        .then(function () {
            return "Site update complete. " + endpointCount + " endpoints updated"
        })

    function buildEndpoints(api) {
        var endpoints = [];
        for(var path in api.paths) {
            var pathSet = api.paths[path]
            for (var method in pathSet) {
                endpoints.push(endpointFactory.create(path, method, pathSet[method]))
            }
        }
        
        return endpoints;
    }

    function publishEndpoints(endpoints) {
        return publisher.publish(config.path, config.url, endpoints)
    }
}

module.exports = {
    publish: publish
}