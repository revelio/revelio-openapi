describe("Type Factory", function () {
    var AssertChain = require("assertchain-jasmine");
    var factory
    
    beforeEach(function () {
        factory = require("../lib/typeFactory.js")
    })

    AssertChain.Extensions.hasName = function (expectedName) {
        this.areEqual(expectedName, this.context.name);
        return this;
    }
    
    AssertChain.Extensions.hasDescription = function (expectedDescription) {
        this.areEqual(expectedDescription, this.context.description);
        return this;
    }
    
    AssertChain.Extensions.hasCount = function (expectedCount) {
        this.areEqual(expectedCount, this.context.length);
        return this;
    }
    
    AssertChain.Extensions.isUndefined = function (value) {
        this.areEqual(undefined, value);
        return this;
    }
    
    it("returns null if the schema is null", function () {
        //Arrange
        
        
        //Act
        var result = factory.create(null)
        
        //Assert
        expect(result).toBeNull();        
    });
    
    it("returns object if the schema is empty", function () {
        //Arrange
        
        
        //Act
        var result = factory.create({})
        
        //Assert
        expect(result).not.toBeNull()
        expect(result.isComplex).toBe(true)        
    });
    
    it("supports simple type", function () {
        //Arrange
        var schema = {
            type: "string",
            description: "some description"
        }
        
        //Act
        var result = factory.create(schema)
        
        //Assert
        AssertChain.with(result, function (obj) {
            this.hasName("string")
                .hasDescription("some description")
                .isFalse(obj.isComplex)
                .isFalse(obj.isCollection)
                .isUndefined(obj.properties) 
        })     
    });
    
    it("supports complex type", function () {
        //Arrange
        var schema = {
            type: "object",
            properties: {
                "prop1" : {
                    type: "string",
                    description: "some description"
                },
                "prop2" : {
                    type: "number",
                    description: "some description2"
                }
            }
        }
        
        //Act
        var result = factory.create(schema)
        
        //Assert
        expect(result.isComplex).toBe(true)
        expect(result.isCollection).toBe(false)
        AssertChain.with(result.properties, function (obj) {
            this.hasCount(2)
                .with(obj[0], function (obj) {
                    this.hasName("prop1")
                        .with(obj.type, function (obj) {
                            this.hasName("string")
                                .hasDescription("some description")
                                .isFalse(obj.isComplex)
                                .isFalse(obj.isCollection)
                                .isUndefined(obj.properties)
                        })
                })
                .with(obj[1], function (obj) {
                    this.hasName("prop2")
                        .with(obj.type, function (obj) {
                            this.hasName("number")
                                .hasDescription("some description2")
                                .isFalse(obj.isComplex)
                                .isFalse(obj.isCollection)
                                .isUndefined(obj.properties)
                        })
                })
        })  
    });
    
    it("supports nested complex type", function () {
        //Arrange
        var schema = {
            type: "object",
            properties: {
                "prop1" : {
                    type: "object",
                    properties: {
                        "inner prop1": {
                            type: "bool",
                            description: "bool description"
                        }
                    },
                    description: "inner object"
                }
            }
        }
        
        //Act
        var result = factory.create(schema)
        
        //Assert
        AssertChain.with(result, function (obj) {
            this.hasName("object")
                .isTrue(obj.isComplex)
                .isFalse(obj.isCollection)
                .areEqual(1, obj.properties.length)
                .with(obj.properties[0], function (obj) {
                    this.hasName("prop1")
                        .hasDescription("inner object")
                        .with(obj.type, function (obj) {
                            this.isTrue(obj.isComplex)
                                .isFalse(obj.isCollection)
                                .areEqual(1, obj.properties.length)
                                .with(obj.properties[0], function (obj) {
                                    this.hasName("inner prop1")
                                        .hasDescription("bool description")
                                        .areEqual("bool", obj.type.name)
                                        .isFalse(obj.type.isComplex)
                                })
                        })
                })
        })
    });
    
    it("supports simple arrays", function () {
        //Arrange
        var schema = {
            type: "array",
            items: {
                type: "string",
                description: "item description"
            }
        }
        
        //Act
        var result = factory.create(schema)
        
        //Assert
        AssertChain.with(result, function (obj) {
            this.isTrue(obj.isCollection)
                .isFalse(obj.isComplex)
                .areEqual("string", obj.collectionType.name)
                .isFalse(obj.collectionType.isComplex)
                .areEqual("item description", obj.collectionType.description)
        });        
    });
    
    it("supports complex arrays", function () {
        //Arrange
        var schema = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    "prop1" : {
                        type: "string",
                        description: "string description"
                    }
                }
            }
        }
        
        //Act
        var result = factory.create(schema)
        
        //Assert
        AssertChain.with(result, function (obj) {
            this.isTrue(obj.isCollection)
                .isFalse(obj.isComplex)
                .areEqual("object", obj.collectionType.name)
                .isTrue(obj.collectionType.isComplex)
                .areEqual(1, obj.collectionType.properties.length)
                .with(obj.collectionType.properties[0], function (obj) {
                    this.hasName("prop1")
                        .hasDescription("string description")
                        .areEqual("string", obj.type.name)
                        .isFalse(obj.type.isComplex)
                })
        });        
    });
    
    describe("with examples", function () {
        it("supports examples extension", function () {
            //Arrange
            var schema = {
                type: "object",
                properties: {
                    "prop1": {
                        type: "string",
                        "x-examples": ["example 1", "example 2"]
                    }
                }
            }
            
            //Act
            var result = factory.create(schema)
            
            //Assert
            expect(result.properties[0].examples.length).toBe(2)
            expect(result.properties[0].examples[0]).toBe("example 1")
            expect(result.properties[0].examples[1]).toBe("example 2")            
        });
        
        it("supports example object", function () {
            //Arrange
            var schema = {
                type: "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string"
                    }
                },
                "example": {
                    "name": "Puma",
                    "id": 1
                }
            }
            
            //Act
            var result = factory.create(schema)
            
            //Assert
            expect(result.properties[0].examples.length).toBe(1)
            expect(result.properties[0].examples[0]).toBe(1)
            expect(result.properties[1].examples.length).toBe(1)
            expect(result.properties[1].examples[0]).toBe("Puma")
        });
        
        it("supports example for simple types", function () {
            //Arrange
            var schema = {
                type: "Object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "format": "int64"
                    },
                    "name": {
                        "type": "string",
                        "example": "Puma"
                    }
                }
            }
            
            //Act
            var result = factory.create(schema)
            
            //Assert
            expect(result.properties[0].examples.length).toBe(0)
            expect(result.properties[1].examples.length).toBe(1)
            expect(result.properties[1].examples[0]).toBe("Puma")
        });
        
    })
    
    describe("with required properties", function () {
        it("sets required properties", function () {
            //Arrange
            var schema = {
                "type": "object",
                "properties": {
                    "id": {
                    "type": "integer"
                    },
                    "name": {
                    "type": "string"
                    }
                },
                "required": [
                    "name"
                ]
            }
            
            //Act
            var result = factory.create(schema)
            
            //Assert
            expect(result.properties[0].name).toBe("id")
            expect(result.properties[0].isOptional).toBe(true)
            expect(result.properties[1].name).toBe("name")
            expect(result.properties[1].isOptional).toBe(false)
            
        });
        
    })
    
    
})