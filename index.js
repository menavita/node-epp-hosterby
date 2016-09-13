'use strict';

var EPP = require('./lib/epp');
var Q = require('q');
var moment = require('moment');

function HosterBY (credential) 
{
  // Сохраняем реквизиты для авторизации
  this.credential = credential;
}

HosterBY.prototype.checkDomain = function(domainName)
{
  var epp = new EPP(this.credential);
  var d = Q.defer();

  epp.hello().then(function (data) {
    console.log('hello:', data);
    epp.login().then(function (data) {
      console.log('login:', data);
      epp.domain_check(domainName).then(function (data) {
          console.log('domain_check:', data);
          d.resolve(data);
          epp.logout();
        }).catch(function (err) {
          console.log('domain_check: Error', err);
          d.reject(err);
          epp.logout();
        });
    }).catch(function (err) {
      console.log('login: Error', err);

      d.reject(err);
      epp.logout();
    });
  }).catch(function (err) {
    console.log('hello: Error', err);
    d.reject(err);
    epp.logout();
  });

  return d.promise;
}

HosterBY.prototype.infoDomain = function(domainName)
{
  var epp = new EPP(this.credential);
  var d = Q.defer();

  epp.hello().then(function (data) {
    console.log('hello:', data);
    epp.login().then(function (data) {
      console.log('login:', data);
      epp.domain_info(domainName).then(function (data) {
          console.log('domain_check:', data);
          d.resolve(data);
          epp.logout();
        }).catch(function (err) {
          console.log('domain_check: Error', err);
          d.reject(err);
          epp.logout();
        });
    }).catch(function (err) {
      console.log('login: Error', err);

      d.reject(err);
      epp.logout();
    });
  }).catch(function (err) {
    console.log('hello: Error', err);
    d.reject(err);
    epp.logout();
  });

  return d.promise;
}

HosterBY.prototype.createDomain = function(domainName, contactId, domainTerm, domainNS)
{
  var epp = new EPP(this.credential);
  var d = Q.defer();

  epp.hello().then(function (data) {
    console.log('hello:', data);
    epp.login().then(function (data) {
      console.log('login:', data);
      epp.domain_create(domainName, contactId, domainTerm, domainNS).then(function (data) {
          console.log('domain_create:', data);
          d.resolve(data);
          epp.logout();
        }).catch(function (err) {
          console.log('domain_create: Error', err);
          d.reject(err);
          epp.logout();
        });
    }).catch(function (err) {
      console.log('login: Error', err);
      d.reject(err);
      epp.logout();
    });
  }).catch(function (err) {
    console.log('hello: Error', err);
    d.reject(err);
    epp.logout();
  });

  return d.promise;
}

HosterBY.prototype.renewDomain = function(domainName, domainTerm)
{
  var epp = new EPP(this.credential);
  var d = Q.defer();

  epp.hello().then(function (data) {
    console.log('hello:', data);
    epp.login().then(function (data) {
      console.log('login:', data);
      epp.domain_renew(domainName, domainTerm).then(function (data) {
          console.log('domain_renew:', data);
          d.resolve(data);
          epp.logout();
        }).catch(function (err) {
          console.log('domain_renew: Error', err);
          d.reject(err);
          epp.logout();
        });
    }).catch(function (err) {
      console.log('login: Error', err);
      d.reject(err);
      epp.logout();
    });
  }).catch(function (err) {
    console.log('hello: Error', err);
    d.reject(err);
    epp.logout();
  });

  return d.promise;
}

HosterBY.prototype.infoContact = function(contactId)
{
  var epp = new EPP(this.credential);
  var d = Q.defer();

  epp.hello().then(function (data) {
    console.log('hello:', data);
    epp.login().then(function (data) {
      console.log('login:', data);
      epp.contact_info(contactId).then(function (data) {
          console.log('contact_info:', data);
          d.resolve(data);
          epp.logout();
        }).catch(function (err) {
          console.log('contact_info: Error', err);
          d.reject(err);
          epp.logout();
        });
    }).catch(function (err) {
      console.log('login: Error', err);
      d.reject(err);
      epp.logout();
    });
  }).catch(function (err) {
    console.log('hello: Error', err);
    d.reject(err);
    epp.logout();
  });

  return d.promise;
}

HosterBY.prototype.createContact = function(contactInfo)
{
  var epp = new EPP(this.credential);
  var d = Q.defer();

  epp.hello().then(function (data) {
    console.log('hello:', data);
    epp.login().then(function (data) {
      console.log('login:', data);
      epp.contact_create(contactInfo).then(function (data) {
          console.log('contact_create:', data);
          d.resolve(data);
          epp.logout();
        }).catch(function (err) {
          console.log('contact_create: Error', err);
          d.reject(err);
          epp.logout();
        });
    }).catch(function (err) {
      console.log('login: Error', err);
      d.reject(err);
      epp.logout();
    });
  }).catch(function (err) {
    console.log('hello: Error', err);
    d.reject(err);
    epp.logout();
  });

  return d.promise;
}

HosterBY.prototype.updateContact = function(contactId, contactInfo)
{
  var epp = new EPP(this.credential);
  var d = Q.defer();

  contactInfo['contactId'] = contactId;

  epp.hello().then(function (data) {
    console.log('hello:', data);
    epp.login().then(function (data) {
      console.log('login:', data);
      epp.contact_update(contactInfo).then(function (data) {
          console.log('contact_update:', data);
          d.resolve(data);
          epp.logout();
        }).catch(function (err) {
          console.log('contact_update: Error', err);
          d.reject(err);
          epp.logout();
        });
    }).catch(function (err) {
      console.log('login: Error', err);
      d.reject(err);
      epp.logout();
    });
  }).catch(function (err) {
    console.log('hello: Error', err);
    d.reject(err);
    epp.logout();
  });

  return d.promise;
}

module.exports = HosterBY;