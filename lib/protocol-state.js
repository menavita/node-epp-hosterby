var EPP = require('../lib/epp.js');
var ProtocolConnection = require('./connection.js');
var parser = require('xml2json');
var moment = require('moment');
var deferred = require('deferred');


var currRegistry;
function ProtocolState(registry, config) {
    currRegistry = registry;
    this.epp = new EPP(registry, config); 
    this.connection = new ProtocolConnection(config);
    this.state = "offline";
    this.loggedIn = false;
}

ProtocolState.prototype.idle = function() {
    var self = this;
    this.state = 'idle';
    this.interval = setInterval(function() {
        var now = moment();
        if (!self.last || now.diff(self.last, 'seconds') > 10) {
            console.log("%s: It's been 60 seconds, calling hello for " + currRegistry, moment());
            self.command('hello', null, 'fake').then(function(helloResponse) {
                console.log("Hello got response: ", helloResponse.toString());
            },
            function(error) {
                console.error("Hello got error: ", error);
            });
        }
    },
    5000);
};

ProtocolState.prototype.resultOk = function(result) {
    if (result.status === 'OK') {
        return true;
    }
    return false;
};
ProtocolState.prototype.processResponse = function(eppJson) {
    var eppData = eppJson.epp;
    console.log("Epp data: ", eppData['response']);
    if (eppData) {
        if (eppData.response) {
            var eppResponse = eppData.response;
            var returnData = {
                "result": eppResponse.result,
                "data": eppResponse.resData,
                "transactionId": eppResponse.trID
            };
            return returnData;
        }
        return eppData;
    }
    return eppJson;
};

ProtocolState.prototype.processReturnedXML = function(returnedXML) {
    //console.log(returnedXML.toString());
    var response = parser.toJson(returnedXML, {
        "object": true
    });
    //console.log(returnedXML.toString());
    var processedResponse = this.processResponse(response);
    if (processedResponse && processedResponse.result) {
        var result = processedResponse.result;
        return processedResponse;
    }
};

ProtocolState.prototype.login = function(data, transactionId) {
    var self = this;

    return this.command('login', data, transactionId).then(function(data) {
        var result = data.result;

        if (result.hasOwnProperty('code') && result.code < 2000) {
            console.log("yes data has code below 2000");
            self.loggedIn = true;
        }
        return data;
    },
    function(error) {
        throw new Error(error);
    });
};


ProtocolState.prototype.execute = function(command, data, transactionId)
{
    var self = this;
    var d = deferred();

    this.command(command, data, transactionId).then(function(data) 
    {
        var result = data.result;

        //console.log('execute', result);
        if (result.hasOwnProperty('code') && result.code < 2000) 
        {
            d.resolve(data);
        }
        else
        {
            d.reject(data);
        }
    },
    function(error) {
        throw new Error(error);
    });

    return d.promise;
};

ProtocolState.prototype.command = function(command, data, transactionId) {
    var self = this;
    // TODO check to see if this does anything useful
    if (this.interval) {
        clearInterval(this.interval);
    }

    this.state = 'command';
    var eppCommand = this.epp[command];
    var xml;
    try {
        if (!eppCommand) throw new Error("Unknown EPP command");
        xml = this.epp[command](data, transactionId);
    } catch(e) {
        if (this.state !== 'idle') {
            self.idle();
        }
        throw e;
    }
    // This is a promise
    return this.connection.send(xml).then(function(buffer) {
        self.last = moment();
        if (command !== 'logout'){
            console.log('idle');
          self.idle();  
        } 
        else {
            console.log('----------logout command---------');
            self.loggedIn = false;
            self.connection.destroyStream();
            if (data.child) {
                console.log("Killing child process.");
                process.exit(0);
            }
        }
        return self.processReturnedXML(buffer);
    },
    function(error) {
        console.error("error handler got something: ", error);
    });
};

module.exports = ProtocolState;

