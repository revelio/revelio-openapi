var program = require("commander")
var app = require("./lib/app");
var async = require("async")
var _ = require("underscore")

program.arguments("<configPath> <revelioUrl> [configName] [options]")
    .option('-p, --publicKey <publicKey>', 'public API key')
    .option('-s, --secretKey <secretKey>', 'secret API key')
    .parse(process.argv);

program.configPath = program.args[0];
program.revelioUrl = program.args[1];
program.configName = program.args[2];
var publisher = require("revelio-publisher");

var revelioConfig;

async.series([
    function (cb) {
        getConfig(program.configPath, program.configName, cb)
    },
    setRevelioUrl,
    setApiKey,
], function (err, data) {
    if (err) {
        logError(err)
        process.exit(0)
    }
    else {
        app.publish(data[0])
            .then(function (msg) {
                console.log(msg)
                process.exit(1)
            }, function (err) {
                logError(err)
                process.exit(0)
            })
    }
})

function logError(err) {
    if (err.constructor === Error) {
        console.error(err.message)
    }
    else {
        console.error(err)
    }
}


function getConfig(configPath, configName, getConfigCb) {
    var path = require("path")
    var fs = require("fs")
    var fullPath = path.resolve(configPath);
    
    async.waterfall([
        readConfig,
        parseConfig,
        validateConfig
    ], function (err, config) {
        getConfigCb(err, config)
    })
    
    function readConfig(cb) {
        fs.readFile(fullPath, "utf8", function (err, fileText) {
            if (err) {
                cb("File '" + fullPath + "' does not exist or is inaccessible")
            }
            else cb(null, fileText)
        });
    }
    
    function parseConfig(fileText, cb) {
        var config;
        try {
            config = JSON.parse(fileText);
        }
        catch (ex) {
            cb("Configuration file is not a valid JSON format")
            return;
        }
        
        var configDir = path.dirname(configPath)
        
        var revelioConfig = {
                target: normalizePath(config.target),
                path: config.path,
                url: config.url,
                parsers: config.parsers
            };
        
            
        if (configName) {
            if (!config.configurations || 
                !config.configurations[configName]) {
                getConfigCb("Configuration " + configName + " does not exist")
                return;
            }
            
            
            var childConfig = config.configurations[configName];
            if (childConfig.target) revelioConfig.target = normalizePath(childConfig.target)
            if (childConfig.path) revelioConfig.path = childConfig.path
            if (childConfig.url) revelioConfig.url = childConfig.url
            if (childConfig.parsers) revelioConfig.parsers = childConfig.parsers
        }
        
        if (revelioConfig.parsers) {
            revelioConfig.parsers = _.mapObject(revelioConfig.parsers, function (file) {
                return normalizePath(file);
            })
        }
        
        function normalizePath(target) {
            return path.resolve(configDir, target)
        }
        
        cb(null, revelioConfig)
    }
    
    function validateConfig(config, cb) {
        if (!config.target || config.target.length == 0) {
            cb("No target specified")
            return;
        }
        if (!config.path || config.path.length == 0) {
            cb("No site path specified")
            return;
        }
        
        cb(null, config);
    }
}

function setRevelioUrl(cb) {
    publisher.setRevelioUrl(program.revelioUrl)
    cb();
}

function setApiKey(cb) {
    if (program.publicKey) {
        if (!program.secretKey) cb("You must provide both public and secret API keys")
        
        publisher.setApiKey(program.publicKey, program.secretKey);
    } 
    else if (program.secretKey) cb("You must provide both public and secret API keys")
    
    cb();
}