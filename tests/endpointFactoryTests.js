describe("Endpoint Factory", function () {
    var AssertChain = require("assertchain-jasmine");
    var factory
    
    var proxyquire = require("proxyquire")
    
    var typeFactoryMock = {
        create: function () {}
    }
    
    beforeEach(function () {
        factory = proxyquire("../lib/endpointFactory.js", {
            "./typeFactory": typeFactoryMock,
            "@noCallThru": true
        })
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
    
    it("throws exception if path is null", function () {
        //Arrange
        
        try {
            //Act
            factory.create(null, "method", {});
            fail();
        }
        catch (e) {
            //Assert
            expect(e.message).toBe("Path is required");
        }                        
    });
    
    it("throws exception if method is null", function () {
        //Arrange
        
        try {
            //Act
            factory.create("path", null, {});
            fail();
        }
        catch (e) {
            //Assert
            expect(e.message).toBe("Method is required");
        }  
    });
    
    it("throws exception if endpoint is null", function () {
        //Arrange
        
        try {
            //Act
            factory.create("path", "method", null);
            fail();
        }
        catch (e) {
            //Assert
            expect(e.message).toBe("Endpoint data is required");
        }  
    });
    
    describe("with basic endpoint information", function () {
        
        it("sets the route of an endpoint", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("some/path/here", "put", data);
            
            //Assert
            expect(result.route).toBe("some/path/here")            
        });
        
        it("sets the HTTP method of an endpoint", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("path", "put", data);
            
            //Assert
            expect(result.method).toBe("put")            
        });
        
        it("sets the description of an endpoint", function () {
            //Arrange
            var data = {
                summary: "some description",
                description: "a longer description"
            }
            
            //Act
            var result = factory.create("path", "put", data);
            
            //Assert
            expect(result.description).toBe("some description")            
        });
        
        it("sets the description to the long description if summary doesn't exist", function () {
            //Arrange
            var data = {
                description: "a longer description"
            }
            
            //Act
            var result = factory.create("path", "put", data);
            
            //Assert
            expect(result.description).toBe("a longer description")            
        });
        
    })
    
    describe("with name information", function () {
        it("sets the name to the operationId if it exists", function () {
            //Arrange
            var data = {
                operationId: "endpointName",
                "x-name": "not used"
            }
            
            //Act
            var result = factory.create("path", "put", data);
            
            //Assert
            expect(result.name).toBe("endpointName")            
        });
        
        it("sets the name to the x-name value if it exists", function () {
            //Arrange
            var data = {
                operationId: null,
                "x-name": "Custom endpoint name"
            }
            
            //Act
            var result = factory.create("path", "put", data);
            
            //Assert
            expect(result.name).toBe("Custom endpoint name")            
        });
        
        it("attempts to generate a name for a list operation", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path", "get", data);
            
            //Assert
            expect(result.name).toBe("List paths")   
        });
        
        it("attempts to generate a name for a get operation with brackets", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path/{id}", "get", data);
            
            //Assert
            expect(result.name).toBe("Get path")   
        });
        
        it("attempts to generate a name for a create (POST) operation", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path", "post", data);
            
            //Assert
            expect(result.name).toBe("Create path")   
        });
        
        it("attempts to generate a name for a update (POST) operation with brackets", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path/{id}", "post", data);
            
            //Assert
            expect(result.name).toBe("Update path")   
        });
        
        it("attempts to generate a name for a create (PUT) operation", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path", "put", data);
            
            //Assert
            expect(result.name).toBe("Create path")   
        });
        
        it("attempts to generate a name for an update (PUT) operation with brackets", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path/{id}", "put", data);
            
            //Assert
            expect(result.name).toBe("Update path")   
        });
        
        it("attempts to generate a name for a create (PATCH) operation", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path", "patch", data);
            
            //Assert
            expect(result.name).toBe("Create path")   
        });
        
        it("attempts to generate a name for an update (PATCH) operation with brackets", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path/{id}", "patch", data);
            
            //Assert
            expect(result.name).toBe("Update path")   
        });
        
        it("attempts to generate a name for a delete operation", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path", "delete", data);
            
            //Assert
            expect(result.name).toBe("Delete paths")   
        });
        
        it("attempts to generate a name for a delete operation with brackets", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path/{id}", "delete", data);
            
            //Assert
            expect(result.name).toBe("Delete path")   
        });
        
        it("attempts to generate a name for a head operation", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path", "head", data);
            
            //Assert
            expect(result.name).toBe("List paths")   
        });
        
        it("attempts to generate a name for a head operation with brackets", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path/{id}", "head", data);
            
            //Assert
            expect(result.name).toBe("Get path")   
        });
        
        it("attempts to generate a name for a options operation", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path", "options", data);
            
            //Assert
            expect(result.name).toBe("Get options for paths")   
        });
        
        it("attempts to generate a name for a options operation with brackets", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path/{id}", "options", data);
            
            //Assert
            expect(result.name).toBe("Get options for path")     
        });
        
        it("attempts to generate a name for an unrecognized operation", function () {
            //Arrange
            var data = {}
            
            //Act
            var result = factory.create("with/a/path/{id}", "something", data);
            
            //Assert
            expect(result.name).toBe("something - with/a/path/{id}")     
        });
        
    })
    
    describe("with parameters", function () {
        beforeEach(function () {
            spyOn(typeFactoryMock, "create").and.returnValue({name: "generatedType"})
        })
        it("adds query string parameters", function () {
            //Arrange
            var data = {
                parameters: [
                    {
                        in: "query",
                        name: "param1",
                        description: "param1 description",
                        type: "string",
                        required: true,
                    },
                    {
                        in: "query",
                        name: "param2",
                        description: "param2 description",
                        type: "number",
                        required: false
                    }
                ]
            }
            
            //Act
            var result = factory.create("path", "get", data)
            
            //Assert
            AssertChain.with(result.parameters, function (obj) {
                this.hasCount(2)
                    .with(obj[0], function (obj) {
                        this.hasName("param1")
                            .hasDescription("param1 description")
                            .areEqual("string", obj.type.name)
                            .isFalse(obj.type.isComplex)
                            .areEqual("query", obj.source)
                            .isFalse(obj.isOptional)
                    })
                    .with(obj[1], function (obj) {
                        this.hasName("param2")
                            .hasDescription("param2 description")
                            .areEqual("number", obj.type.name)
                            .isFalse(obj.type.isComplex)
                            .areEqual("query", obj.source)
                            .isTrue(obj.isOptional)
                    })
            })
        });
        
        it("adds body parameters", function () {
            //Arrange
            var data = {
                parameters: [
                    {
                        in: "body",
                        schema: {
                            type: "object",
                            properties: {
                                test: {}
                            }
                        }
                    },
                ]
            }
            
            //Act
            var result = factory.create("path", "post", data);
            
            //Assert
            expect(result.parameters.length).toBe(1)
            var body = result.parameters[0];
            expect(body.type.name).toBe("generatedType");
            expect(body.source).toBe("body")
            
            expect(typeFactoryMock.create).toHaveBeenCalledWith({
                type: "object",
                properties: {
                    test: {}
                }
            })
        });
        
        it("adds path parameters", function () {
            //Arrange
            var data = {
                parameters: [
                    {
                        in: "path",
                        name: "param1",
                        description: "param1 description",
                        type: "string"
                    },
                    {
                        in: "path",
                        name: "param2",
                        description: "param2 description",
                        type: "number"
                    }
                ]
            }
            
            //Act
            var result = factory.create("path", "get", data)
            
            //Assert
            AssertChain.with(result.parameters, function (obj) {
                this.hasCount(2)
                    .with(obj[0], function (obj) {
                        this.hasName("param1")
                            .hasDescription("param1 description")
                            .areEqual("string", obj.type.name)
                            .areEqual("route", obj.source)
                            .isFalse(obj.isOptional)
                    })
                    .with(obj[1], function (obj) {
                        this.hasName("param2")
                            .hasDescription("param2 description")
                            .areEqual("number", obj.type.name)
                            .areEqual("route", obj.source)
                            .isFalse(obj.isOptional)
                    })
            })
        });
        
        it("allows examples for query string parameters", function () {
            //Arrange
            var data = {
                parameters: [
                    {
                        in: "query",
                        "x-examples": [
                            "example 1",
                            "example 2"    
                        ]
                    }
                ]
            }
            
            //Act
            var result = factory.create("path", "get", data);
            
            //Assert
            expect(result.parameters[0].examples.length).toBe(2);
            expect(result.parameters[0].examples[0]).toBe("example 1")
            expect(result.parameters[0].examples[1]).toBe("example 2")
        });
        
        it("allows examples for path parameters", function () {
            //Arrange
            var data = {
                parameters: [
                    {
                        in: "path",
                        "x-examples": [
                            "example 1",
                            "example 2"    
                        ]
                    }
                ]
            }
            
            //Act
            var result = factory.create("path", "get", data);
            
            //Assert
            expect(result.parameters[0].examples.length).toBe(2);
            expect(result.parameters[0].examples[0]).toBe("example 1")
            expect(result.parameters[0].examples[1]).toBe("example 2")
        });
        
    })
    
    describe("with responses", function () {
        beforeEach(function () {
            spyOn(typeFactoryMock, "create").and.returnValue({name: "generatedType"})
        })
        
        it("adds responses", function () {
            //Arrange
            var data = {
                responses: {
                    "400": {
                        description: "400 description",
                        schema: {
                            type: "400 type"
                        }
                    },
                    "404": {
                        description: "404 without schema"
                    }
                }
            }
            
            //Act
            var result = factory.create("path", "get", data);
            
            //Assert
            AssertChain.with(result.responses, function (obj) {
                this.hasCount(2)
                    .with(obj[0], function (obj) {
                        this.hasDescription("400 description")
                            .areEqual("400", obj.code)
                            .areEqual("generatedType", obj.type.name)
                    })
                    .with(obj[1], function (obj) {
                        this.hasDescription("404 without schema")
                            .areEqual("404", obj.code)
                            .isNull(obj.type)
                    })
            })
            expect(typeFactoryMock.create).toHaveBeenCalledWith({
                type: "400 type"
            })
        });
    })
    
    describe("with tags", function () {
        it("adds tags", function () {
            //Arrange
            var data = {
                tags: ["tag 1", "tag 2"]
            }
            
            //Act
            var result = factory.create("path", "get", data)
            
            //Assert
            expect(result.tags.length).toBe(2)
            expect(result.tags[0]).toBe("tag 1")
            expect(result.tags[1]).toBe("tag 2")            
        });
        
    })
    
    describe("with metadata", function () {
        
        it("adds any extensions as metadata, other than name", function () {
            //Arrange
            var data = {
                "x-name": "Endpoint name",
                "x-item1": [1, 2, 3],
                "x-some-other-item": {
                    test: true
                }
            }
            
            //Act
            var result = factory.create("path", "get", data)
            
            //Assert
            expect(result.name).toBe("Endpoint name")
            expect(result.metadata.name).toBeUndefined()
            expect(result.metadata.item1[0]).toBe(1)
            expect(result.metadata.item1[1]).toBe(2)
            expect(result.metadata.item1[2]).toBe(3)
            expect(result.metadata["some-other-item"].test).toBe(true)
        });
        
    })
})