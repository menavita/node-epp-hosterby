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

HosterBY.prototype.createDomain = function(domainName, contactId, domainTerm)
{
  var self = this;
  var d = deferred();
  var state = new ProtocolState('hosterby', this.credential);

  var domainInfoCompiled = {
    name: domainName, 
    registrant: contactId, 
    period: domainTerm, 
    ns: { "domain:hostObj": ['ns1.staronka.by','ns2.staronka.by'] } 
  };
  
  state.connection.initStream().then(function() 
  {
    state.login({ "login": self.credential.login, "password": self.credential.password }, ['login', moment().unix()].join('-'))
    .then(
      function(result) 
      {
        //console.log(result);
        state.execute('createDomain', domainInfoCompiled, ['createDomain', moment().unix()].join('-') )
        .then(
          function(result) 
          { 
            //console.log('result');
            d.resolve(result.data);
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          },
          function(error) 
          { 
            //console.log('error');
            d.reject(error); 
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          });
      },
      function(error) 
      { 
        //console.log('error2');
        d.reject(error); 
        state.command('logout', null, ['logout', moment().unix()].join('-'));
      });
  });

  return d.promise;
}


HosterBY.prototype.createContact = function(contactInfo)
{
  //console.log(contactInfo);
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
        state.execute('createContact', contactInfoCompiled, ['createContact', moment().unix()].join('-') )
        .then(
          function(result) 
          { 
            //console.log('createContact.resolve');
            d.resolve(result); 
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          },
          function(error) 
          { 
            //console.log('createContact.reject');
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


HosterBY.prototype.updateContact = function(contactId, contactInfo)
{
  var self = this;
  var d = deferred();
  var state = new ProtocolState('hosterby', this.credential);

  var contactInfoCompiled = 
  {
    "update": 
    {
      "contact:update": {
        "_attr": 
        {
            "xmlns:contact": this.credential.namespaces.contact.xmlns,
            "xsi:schemaLocation": "urn:ietf:params:xml:ns:contact-1.0 contact-1.0.xsd"

        },
        "contact:id": contactId,
        "contact:chg": contactInfo['contact']
      }
    },
    "extension": { "by-ext-contact:update": contactInfo['extension'] }
  };
/*
  contactInfoCompiled["create"]["contact:update"]["_attr"] = 
  { 
    "xmlns:contact": this.credential.namespaces.contact.xmlns,
    "xsi:schemaLocation": "urn:ietf:params:xml:ns:contact-1.0 contact-1.0.xsd"
  };
  contactInfoCompiled["create"]["contact:create"]["contact:postalInfo"]["_attr"] = { "type": 'loc' };
  contactInfoCompiled["extension"]["by-ext-contact:create"]["_attr"] = this.credential.namespaces.extension;
*/
  state.connection.initStream().then(function() 
  {
    state.login({ "login": self.credential.login, "password": self.credential.password }, ['login', moment().unix()].join('-'))
    .then(
      function(result) 
      {
        state.execute('updateContact', contactInfoCompiled, ['updateContact', moment().unix()].join('-') )
        .then(
          function(result) 
          { 
            //console.log('updateContact.resolve');
            d.resolve(result); 
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          },
          function(error) 
          { 
            //console.log('updateContact.reject');
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


HosterBY.prototype.infoContact = function(contactId)
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
        state.execute('infoContact', {id:contactId }, ['infoContact', moment().unix()].join('-') )
        .then(
          function(result) 
          { 
            //console.log('infoContact.resolve');
            d.resolve(result); 
            state.command('logout', null, ['logout', moment().unix()].join('-'));
          },
          function(error) 
          { 
            //console.log('infoContact.reject');
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