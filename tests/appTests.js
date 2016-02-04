describe("App", function () {
    var _proxyquire = require("proxyquire");
    var Promise = require("bluebird")
    var _revelioPublisherMock = {
        publish: function () {}
    }
    var _parserMock = {
        validate: function () {}
    }
    var _endpointFactoryMock = {
        create: function () {}
    }
    
    var _app;
    
    beforeEach(function () {
        _app = _proxyquire("../lib/app", {
            "revelio-publisher": _revelioPublisherMock,
            "./endpointFactory": _endpointFactoryMock,
            "swagger-parser": _parserMock,
            "@noCallThru": true
        });
    })
    
    it("returns error if nothing is parsed", function (done) {
        //Arrange
        var api = {
            paths: {}
        }
        spyOn(_parserMock, "validate").and.returnValue(getMockPromise(api))
        spyOn(_endpointFactoryMock, "create")
        
        //Act
        var promise = _app.publish({})
        
        //Assert
        promise.catch(function (err) {
            expect(err.message).toBe("No endpoints detected")
            expect(_endpointFactoryMock.create).not.toHaveBeenCalled()
        })
        .finally(assertPromiseWasFulfilled(promise, done))
    })
    
    it("calls API if endpoints exist", function (done) {
        //Arrange
        var api = {
            paths: {
                "/path1" : {
                    "get": {
                        description: "endpoint 1"
                    },
                    "put": {
                        description: "endpoint 2"
                    }
                },
                "/path2": {
                    "post": {
                        description: "endpoint 3"
                    }
                }
            }
        }
        spyOn(_parserMock, "validate").and.returnValue(getMockPromise(api))
        spyOn(_endpointFactoryMock, "create").and.returnValues({
            name: "endpoint1"
        }, {
            name: "endpoint2"
        }, {
            name: "endpoint3"
        })
        spyOn(_revelioPublisherMock, "publish").and
            .returnValue(getMockPromise({}))
        
        //Act
        var promise = _app.publish({ path: "site path", url: "site url"});
        
        //Assert
        promise.then(function (result) {
            expect(result).toBe("Site update complete. 3 endpoints updated")
            expect(_endpointFactoryMock.create).toHaveBeenCalledWith("/path1", "get", {
                description: "endpoint 1"
            })
            expect(_endpointFactoryMock.create).toHaveBeenCalledWith("/path1", "put", {
                description: "endpoint 2"
            })
            expect(_endpointFactoryMock.create).toHaveBeenCalledWith("/path2", "post", {
                description: "endpoint 3"
            })
            expect(_revelioPublisherMock.publish)
                .toHaveBeenCalledWith("site path", "site url", [{
                    name: "endpoint1"
                },{
                    name: "endpoint2"
                },{
                    name: "endpoint3"
                }])
        })
        .finally(assertPromiseWasFulfilled(promise, done));        
    });
    
    function assertPromiseWasFulfilled(promise, done) {
        return function () {
            if (!promise.isFulfilled() && !promise.isRejected()) throw "Promise not fulfilled"
            done();
        }
    }

    function getMockPromise(result) {
        return Promise.resolve(result);
    }
})