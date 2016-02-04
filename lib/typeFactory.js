var _ = require("underscore")

function create(schema) {
    if (schema == null) return null
    
    if (!schema.type) schema.type = "object"
    
    var type = {
       name: schema.type,
       description: schema.description,
       isComplex: false,
       isCollection: false
    }
    
    switch (schema.type.toLowerCase()) {
        case "object":
            buildComplexType()
            break;
        case "array":
            buildCollection()
            break;
    }
    
    return type
    
    function buildComplexType() {
        type.isComplex = true
        type.properties = []
        for (var x in schema.properties) {
            var prop = schema.properties[x]
            type.properties.push({
                name: x,
                description: prop.description,
                type: create(prop),
                examples: getExamples(x),
                isOptional: getIsOptional(x)
            })
        }
    }
    
    function getExamples(propertyName) {
        var examples = []
        
        if (schema.example && schema.example[propertyName]) {
            examples.push(schema.example[propertyName])
        }
        
        var property = schema.properties[propertyName]
        
        if (property.example) examples.push(property.example)
        
        if (property["x-examples"]) {
            examples = _.union(examples, property["x-examples"])
        }
        
        return examples
    }
    
    function getIsOptional(propertyName) {
        return !schema.required || _.indexOf(schema.required, propertyName) == -1 
    }
    
    function buildCollection() {
        type.isCollection = true
        type.collectionType = create(schema.items)
    }
}

module.exports = {
    create: create
}