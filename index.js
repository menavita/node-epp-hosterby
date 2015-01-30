'use strict';

var ProtocolState = require('./lib/protocol-state.js');
var moment = require('moment');
var deferred = require('deferred');

function HosterBY (credential) 
{
  // Сохраняем реквизиты для авторизации
  this.credential = credential;
}

HosterBY.prototype.checkDomain = function(domainName)
{
  var _this = this;
  var d = deferred();
  var state = new ProtocolState('hosterby', this.credential);

  state.connection.initStream().then(function() 
  {
    state.login({ "login": _this.credential.login, "password": _this.credential.password }, ['login', moment().unix()].join('-'))
    .then(
      function(result) 
      {
        state.command('checkDomain', { name: domainName }, ['checkDomain', moment().unix()].join('-') )
        .then(
          function(result) { d.resolve(result.data['domain:chkData']['domain:cd']['domain:name']); },
          function(error) { d.reject(error); });
      },
      function(error) { d.reject(error); });
  });

  setTimeout(function() { state.command('logout', null, ['logout', moment().unix()].join('-')); }, 5000);

  return d.promise;
}

HosterBY.prototype.createDomain = function(domainName)
{
  var _this = this;
  var d = deferred();
  var state = new ProtocolState('hosterby', this.credential);

  state.connection.initStream().then(function() 
  {
    state.login({ "login": _this.credential.login, "password": _this.credential.password }, ['login', moment().unix()].join('-'))
    .then(
      function(result) 
      {
        state.command('createDomain', { name: domainName, registrant: 4821, ns: { "domain:hostObj": ['ns1.staronka.by','ns2.staronka.by'] } }, ['createDomain', moment().unix()].join('-') )
        .then(
          function(result) { d.resolve(result.data['domain:chkData']['domain:cd']['domain:name']); },
          function(error) { d.reject(error); });
      },
      function(error) { d.reject(error); });
  });

  setTimeout(function() { state.command('logout', null, ['logout', moment().unix()].join('-')); }, 5000);

  return d.promise;
}


HosterBY.prototype.createContact = function(contactInfo)
{
  console.log(contactInfo);
  var _this = this;
  var d = deferred();
  var state = new ProtocolState('hosterby', this.credential);

  var contactInfoCompiled = {
    "create": { "contact:create": contactInfo['contact'] },
    "extension": { "by-ext-contact:create": contactInfo['extension'] }
  };
  contactInfoCompiled["create"]["contact:create"]["_attr"] = 
  { 
    "xmlns:contact": this.credential.namespaces.contact.xmlns,
    "xsi:schemaLocation": "urn:ietf:params:xml:ns:contact-1.0 contact-1.0.xsd"
  };
  contactInfoCompiled["create"]["contact:create"]["contact:postalInfo"]["_attr"] = { "type": 'int' };
  contactInfoCompiled["extension"]["by-ext-contact:create"]["_attr"] = { "xmlns:by-ext-contact": this.credential.namespaces.extension.xmlns };

  state.connection.initStream().then(function() 
  {
    state.login({ "login": _this.credential.login, "password": _this.credential.password }, ['login', moment().unix()].join('-'))
    .then(
      function(result) 
      {
        state.command('createContact', contactInfoCompiled, ['createContact', moment().unix()].join('-') )
        .then(
          function(result) { d.resolve(result.data); },
          function(error) { d.reject(error); });
      },
      function(error) { d.reject(error); });
  });

  setTimeout(function() { state.command('logout', null, ['logout', moment().unix()].join('-')); }, 5000);

  return d.promise;
}

module.exports = HosterBY;