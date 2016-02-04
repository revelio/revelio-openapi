var pluralize = require ("pluralize")
var typeFactory = require("./typeFactory")

function create(path, method, data) {
    if (!path) throw new Error("Path is required")
    if (!method) throw new Error("Method is required")
    if (!data) throw new Error("Endpoint data is required")
    
    var endpoint = {
        route: path,
        method: method
    };
    
    setName(path, method, data, endpoint);
    setDescription(data, endpoint);
    setParameters(data, endpoint);
    setResponses(data, endpoint)
    setMetadata(data, endpoint)
    setTags(data, endpoint)
    
    return endpoint
}

var pathTemplateRegex = /(\w+)\/?(\{(\w+)\}|:(\w+))?$/
function setName(path, method, doc, endpoint) {
    
    if (doc.operationId) {
        endpoint.name = doc.operationId;
        return;
    }
    
    if (doc["x-name"]) {
        endpoint.name = doc["x-name"];
        return;
    }
    
    endpoint.name = generateName();
    
    function generateName() {
        var template = path.match(pathTemplateRegex);
        var isTemplated = template[3] || template[4]
        var itemName = template[1]
        
        switch (method.toLowerCase()) {
            case "get":
            case "head":
                return isTemplated 
                    ? "Get " + pluralize(itemName, 1)
                    : "List " + pluralize(itemName)
            case "post":
            case "put":
            case "patch":
                return isTemplated
                ? "Update " + pluralize(itemName, 1)
                : "Create " + pluralize(itemName, 1)
            case "delete":
                return "Delete " + pluralize(itemName, isTemplated ? 1 : null)
            case "options":
                return "Get options for " + pluralize(itemName, isTemplated ? 1 : null)
        }
        
        return method + " - " + path
    }
}

function setDescription(doc, endpoint) {
    endpoint.description = doc.summary != null ? doc.summary : doc.description;
}

function setParameters(doc, endpoint) {
    endpoint.parameters = []
    
    if (doc.parameters == null) return;
    
    for (var i in doc.parameters) {
        var param = doc.parameters[i]
        
        var source = getSource(param.in)
        var newParam = {
            name: param.name,
            description: param.description,
            source: source
        }
        if (source == "body") {
            newParam.type = typeFactory.create(param.schema)
        } else {
            newParam.isOptional = source != "route" && param.required !== true
            newParam.type = {
                isComplex: false,
                name: param.type
            }
            newParam.examples = param["x-examples"]
        }
        
        endpoint.parameters.push(newParam);
    }
    
    function getSource(val) {
        if (val == "query") return "query"
        if (val == "body") return "body"
        if (val == "path") return "route"
    }
    
}

function setResponses(doc, endpoint) {
    endpoint.responses = [];
    
    for (var code in doc.responses) {
        var response = doc.responses[code];
        endpoint.responses.push({
            code: code,
            description: response.description,
            type: response.schema ? typeFactory.create(response.schema) : null
        })
    }
}

var excludedMetadataRegex = /x-name/
function setMetadata(doc, endpoint) {
    
    var hasMetadata = false;
    var metadata = {};
    for (var x in doc) {
        if (x.startsWith("x-") && !excludedMetadataRegex.test(x))
        {
            hasMetadata = true
            metadata[x.substring(2)] = doc[x]
        }
    }
    
    if (hasMetadata) endpoint.metadata = metadata
}

function setTags(doc, endpoint) {
    endpoint.tags = doc.tags
}

module.exports = {
    create: create
}