var tls = require('tls');
var net = require('net');
var fs = require('fs');
var Q = require('q');
var moment = require('moment');

function ProtocolConnection(config) {
  this.config = config;
}

ProtocolConnection.prototype.clientResponse = function(xml) {
  console.log("Received: ", xml.toString());
};

ProtocolConnection.prototype.setStream = function(newStream) {
  this.stream = newStream;
};

ProtocolConnection.prototype.initStream = function() {
  var self = this;
  var deferred = Q.defer();
  var config = this.config;
  var greeting = false;

  try {
    var newStream;
    var options = {
      "host": config.host,
      "port": config.port
    };

    newStream = net.connect(options, function() {
      console.info("Established a connection.");
    });

    newStream.on('readable', function () {
      self.readStream();
      // We need to mark connection inited 
      // after first greeting message from server
      if(!greeting)
      {
        deferred.resolve();
        greeting = true;
      }
    });

    newStream.on('clientError', function(exception, securePair) {
      deferred.reject(exception);
    });

    newStream.on('end', function() {
      console.log("%s :Got an end event", moment());
      server.close();
    });
    
    self.setStream(newStream);
  } catch(e) {
    deferred.reject(e);
  }
  return deferred.promise;
};

ProtocolConnection.prototype.destroyStream = function() {
  var self = this;
  var deferred = Q.defer();

  try {
    self.stream.destroy();
  } catch(e) {
    deferred.reject(e);
  }
  return deferred.promise;
};

ProtocolConnection.prototype.readStream = function () {
  var stream = this.stream;
  var streamBuffer = stream.read();
  var streamBufferLength = streamBuffer.length;
  if (streamBufferLength > 4) {
    var buffer = this.checkEndianLength(streamBuffer);
    this.clientResponse(buffer);
  }
};

ProtocolConnection.prototype.checkEndianLength = function checkEndianLength(buffer) {
  var bigEndian = buffer.slice(0, 4);
  var restOfBuffer = buffer.slice(4, null);
  var totalLength = bigEndian.readUInt32BE(0);
  var lengthWithoutEndian = totalLength - 4;
  if (buffer.length === totalLength || restOfBuffer.length === totalLength) {
    return restOfBuffer;
  }
  return buffer;
};
ProtocolConnection.prototype.processBigEndian = function(xml) {
  var xmlBuffer = new Buffer(xml);

  var xmlLength = xml.length;
  var endianLength = xml.length + 4;
  var b = new Buffer(4);
  b.writeUInt32BE(endianLength, 0);
  var preppedXML = Buffer.concat([b, xmlBuffer]);
  return preppedXML;
};
ProtocolConnection.prototype.send = function(xml) {
  var deferred = Q.defer();
  // Called in "readStream()" when the stream gets input from EPP server.
  this.clientResponse = function(buffer) {
    deferred.resolve(buffer);
  };
  var preparedXML = this.processBigEndian(xml);
  console.log(preparedXML.toString());
  this.stream.write(preparedXML, "utf8", function() {
    console.log("Finished writing to server:",xml.toString());
  });
  return deferred.promise;
};
module.exports = ProtocolConnection;

