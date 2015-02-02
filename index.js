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
  var self = this;
  var d = deferred();
  var state = new ProtocolState('hosterby', this.credential);

  state.connection.initStream().then(function() 
  {
    state.login({ "login": self.credential.login, "password": self.credential.password }, ['login', moment().unix()].join('-'))
    .then(
      function(result) 
      {
        state.command('checkDomain', { name: domainName }, ['checkDomain', moment().unix()].join('-') )
        .then(
          function(result) 
          { 
            d.resolve(result.data['domain:chkData']['domain:cd']['domain:name']); 
            state.command('logout', null, ['logout', moment().unix()].join('-')); 
          },
          function(error) 
          { 
            d.reject(error); 
            state.command('logout', null, ['logout', moment().unix()].join('-')); 
          });
      },
      function(error) 
      { 
        d.reject(error); 
        state.command('logout', null, ['logout', moment().unix()].join('-')); 
      });
  });

  return d.promise;
}

HosterBY.prototype.createDomain = function(domainName)
{
  var self = this;
  var d = deferred();
  var state = new ProtocolState('hosterby', this.credential);

  state.connection.initStream().then(function() 
  {
    state.login({ "login": self.credential.login, "password": self.credential.password }, ['login', moment().unix()].join('-'))
    .then(
      function(result) 
      {
        state.command('createDomain', { name: domainName, registrant: 4821, ns: { "domain:hostObj": ['ns1.staronka.by','ns2.staronka.by'] } }, ['createDomain', moment().unix()].join('-') )
        .then(
          function(result) 
          { 
            d.resolve(result.data['domain:chkData']['domain:cd']['domain:name']);
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          },
          function(error) 
          { 
            d.reject(error); 
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          });
      },
      function(error) 
      { 
        d.reject(error); 
        state.command('logout', null, ['logout', moment().unix()].join('-'));
      });
  });

  return d.promise;
}


HosterBY.prototype.createContact = function(contactInfo)
{
  console.log(contactInfo);
  var self = this;
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
  contactInfoCompiled["create"]["contact:create"]["contact:postalInfo"]["_attr"] = { "type": 'loc' };
  contactInfoCompiled["extension"]["by-ext-contact:create"]["_attr"] = this.credential.namespaces.extension;

  state.connection.initStream().then(function() 
  {
    state.login({ "login": self.credential.login, "password": self.credential.password }, ['login', moment().unix()].join('-'))
    .then(
      function(result) 
      {
        state.command('createContact', contactInfoCompiled, ['createContact', moment().unix()].join('-') )
        .then(
          function(result) 
          { 
            d.resolve(result.data); 
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          },
          function(error) 
          { 
            d.reject(error); 
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          });
      },
      function(error) 
      { 
        d.reject(error);
        state.command('logout', null, ['logout', moment().unix()].join('-'));
      });
  });

  return d.promise;
}

module.exports = HosterBY;