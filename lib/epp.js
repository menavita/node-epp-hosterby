'use strict';

let connection = require('./connection');
let PreparateXML = require('./praparate-xml');
let util = require('./util');
let _ = require('lodash');
let Q = require('q');

class Epp {
  constructor(config) {
    this.config = config;
    this.connection = new connection(config);
    this.preparateXML = new PreparateXML(config);
    this.init();
  }

  init() {
    this.connection.initStream();
  }

  //**
  //* Authentication
  //*

  login(newPassword) {
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/login.xml', {
      clID: this.config.login,
      pw: this.config.password
    });

    xml = util.templateCompile(xml);

    this.connection.send(xml).then((data) => {
      defer.resolve({
        code: util.eval(data, 'epp.response.result.code'),
        message: util.eval(data, 'epp.response.result.msg.$t')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  logout() {
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/logout.xml');

    this.connection.send(xml).then((data) => {
      defer.resolve({
        code: util.eval(data, 'epp.response.result.code'),
        message: util.eval(data, 'epp.response.result.msg.$t')
      });
      this.connection.destroyStream();
    }).catch((err) => {
      (err.code === '1500') ? defer.resolve(err): defer.reject(err);
    });

    return defer.promise;
  }

  //**
  //* Contact
  //*

  contact_create(contact) {
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/by_contact_create_'+contact['extensionType']+'.xml', contact);

    this.connection.send(xml).then((data) => {
      defer.resolve({
        client_id: util.eval(data, 'epp.response.resData.contact:creData.contact:id'),
        client_creation: util.eval(data, 'epp.response.resData.contact:creData.contact:crDate'),
        clTRID: util.eval(data, 'epp.response.trID.clTRID')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  contact_info(contact_id) {
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/contact_info.xml', {
      client_id: contact_id
    });

    this.connection.send(xml).then((data) => {
      defer.resolve({
        client_id: util.eval(data, 'epp.response.resData.contact:infData.contact:id'),
        client_roid: util.eval(data, 'epp.response.resData.contact:infData.contact:roid'),
        client_name: util.eval(data, 'epp.response.resData.contact:infData.contact:postalInfo.contact:name'),
        client_address_1: util.eval(data, 'epp.response.resData.contact:infData.contact:postalInfo.contact:addr.contact:street')[0],
        client_address_2: util.eval(data, 'epp.response.resData.contact:infData.contact:postalInfo.contact:addr.contact:street')[1],
        client_city: util.eval(data, 'epp.response.resData.contact:infData.contact:postalInfo.contact:addr.contact:city'),
        client_state: util.eval(data, 'epp.response.resData.contact:infData.contact:postalInfo.contact:addr.contact:sp'),
        client_zipcode: util.eval(data, 'epp.response.resData.contact:infData.contact:postalInfo.contact:addr.contact:pc'),
        client_country: util.eval(data, 'epp.response.resData.contact:infData.contact:postalInfo.contact:addr.contact:cc'),
        client_phone: util.eval(data, 'epp.response.resData.contact:infData.contact:voice'),
        client_email: util.eval(data, 'epp.response.resData.contact:infData.contact:email'),
        client_create: util.eval(data, 'epp.response.resData.contact:infData.contact:crDate'),
        client_update: util.eval(data, 'epp.response.resData.contact:infData.contact:upDate')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  domain_info(domain){
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/domain_info.xml', {
      name: domain
    });

    this.connection.send(xml).then((data) => {
      defer.resolve({
        domain_name: util.eval(data, 'epp.response.resData.domain:infData.domain:name'),
        domain_crDate: util.eval(data, 'epp.response.resData.domain:infData.domain:crDate'),
        domain_exDate: util.eval(data, 'epp.response.resData.domain:infData.domain:exDate'),
        domain_status: util.eval(data, 'epp.response.resData.domain:infData.domain:status'),
        domain_registrant: util.eval(data, 'epp.response.resData.domain:infData.domain:registrant'),
        domain_ns: util.eval(data, 'epp.response.resData.domain:infData.domain:ns.domain:hostObj')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  contact_update(contact) {
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/by_contact_update_'+contact['extensionType']+'.xml', contact);

    this.connection.send(xml).then((data) => {
      defer.resolve({
        code: util.eval(data, 'epp.response.result.code'),
        message: util.eval(data, 'epp.response.result.msg.$t')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  //**
  //* Domain
  //*

  domain_check(domain_name) {
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/domain_check.xml', { domain_name });

    this.connection.send(xml).then((data) => {
      defer.resolve({
        domain_name: util.eval(data, 'epp.response.resData.domain:chkData.domain:cd.domain:name.$t'),
        domain_available: util.eval(data, 'epp.response.resData.domain:chkData.domain:cd.domain:name.avail'),
        domain_reason: util.eval(data, 'epp.response.resData.domain:chkData.domain:cd.domain:reason')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  /*domain_info(domain_name, ticket_number) {
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/br_domain_info.xml', {
      ticket_number: ticket_number || '',
      domain_name
    });

    this.connection.send(xml).then((data) => {
      defer.resolve({
        domain_name: util.eval(data, 'epp.response.resData.domain:infData.domain:name'),
        domain_roid: util.eval(data, 'epp.response.resData.domain:infData.domain:roid'),
        domain_status: util.eval(data, 'epp.response.resData.domain:infData.domain:status.s'),
        domain_contact: {
          [util.eval(data, 'epp.response.resData.domain:infData.domain:contact.0.type')]: util.eval(data, 'epp.response.resData.domain:infData.domain:contact.0.$t'),
          [util.eval(data, 'epp.response.resData.domain:infData.domain:contact.1.type')]: util.eval(data, 'epp.response.resData.domain:infData.domain:contact.1.$t'),
          [util.eval(data, 'epp.response.resData.domain:infData.domain:contact.2.type')]: util.eval(data, 'epp.response.resData.domain:infData.domain:contact.2.$t')
        },
        domain_ticket: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:ticketNumber'),
        domain_organization: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:organization'),
        domain_publication: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:publicationStatus.publicationFlag'),
        domain_doc: {
          doc_message: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:pending.brdomain:doc.brdomain:description.$t'),
          doc_status: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:pending.brdomain:doc.status')
        },
        domain_dns: {
          dns_1: util.eval(data, 'epp.response.resData.domain:infData.domain:ns.domain:hostAttr.0.domain:hostName'),
          dns_2: util.eval(data, 'epp.response.resData.domain:infData.domain:ns.domain:hostAttr.1.domain:hostName'),
          dns_1_status: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:pending.brdomain:dns.0.status')
        },
        domain_dns_pending: {
          dns_1: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:pending.brdomain:dns.0.brdomain:hostName'),
          dns_2: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:pending.brdomain:dns.1.brdomain:hostName')
        },
        domain_create: util.eval(data, 'epp.response.resData.domain:infData.domain:crDate'),
        domain_expiration: util.eval(data, 'epp.response.resData.domain:infData.domain:exDate'),
        domain_autorenew: util.eval(data, 'epp.response.extension.brdomain:infData.brdomain:autoRenew.active')
      });
    }).catch(defer.reject);

    return defer.promise;
  }*/

  domain_create(domain_name, contact_id, domain_term, domain_ns) {
    let defer = Q.defer();
    var domain = {
      domainName: domain_name,
      domainRegistrant: contact_id,
      domainPeriod: domain_term,
      domainHostObj1: domain_ns[0],
      domainHostObj2: domain_ns[1]
    };
    let xml = this.preparateXML.parse('/templates/by_domain_create.xml', domain);

    this.connection.send(xml).then((data) => {
      defer.resolve({
        domain_name: util.eval(data, 'epp.response.resData.domain:creData.domain:name'),
        domain_create: util.eval(data, 'epp.response.resData.domain:creData.domain:crDate'),
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  domain_update(domain) {
    let defer = Q.defer();
    let xml;

    domain.client_id = domain.client_id || '';
    domain.domain_ticket = domain.domain_ticket || '';


    this.domain_info(domain.domain_name, domain.domain_ticket).then((data) => {
      _.merge(domain, {
        old_dns_1: data.domain_dns.dns_1,
        old_dns_2: data.domain_dns.dns_2,
        domain_contact_admin: data.domain_contact.admin,
        domain_contact_tech: data.domain_contact.tech,
        domain_contact_billing: data.domain_contact.billing
      });

      xml = this.preparateXML.parse('/templates/br_domain_update.xml', domain);
      xml = util.templateCompile(xml);

      this.connection.send(xml).then((data) => {
        defer.resolve({
          code: util.eval(data, 'epp.response.result.code'),
          message: util.eval(data, 'epp.response.result.msg.$t')
        });
      }).catch(defer.reject);
    }).catch(defer.reject);

    return defer.promise;
  }

  domain_renew(domain_name, domain_term) {
    let defer = Q.defer();
    var domain = {
      domainName: domain_name,
      domainPeriod: domain_term
    };
    let xml = this.preparateXML.parse('/templates/by_domain_renew.xml', domain);

    this.connection.send(xml).then((data) => {
      defer.resolve({
        domain_name: util.eval(data, 'epp.response.resData.domain:renData.domain:name'),
        domain_new_expiration: util.eval(data, 'epp.response.resData.domain:renData.domain:exDate'),
        domain_publication_status: util.eval(data, 'epp.response.extension.brdomain:renData.brdomain:publicationStatus.publicationFlag')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  domain_delete(domain_name) {
    let defer = Q.defer();
    let xml;

    xml = this.preparateXML.parse('/templates/domain_delete.xml', {
      domain_name: domain_name
    });

    this.connection.send(xml).then((data) => {
      defer.resolve({
        code: util.eval(data, 'epp.response.result.code'),
        message: util.eval(data, 'epp.response.result.msg.$t')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  //**
  //* Poll
  //*
  poll_request() {
    let defer = Q.defer();
    let xml;

    xml = this.preparateXML.parse('/templates/poll_request.xml', {
      op: 'req',
      msgID: ''
    });

    this.connection.send(xml).then((data) => {
      defer.resolve({
        msg_count: util.eval(data, 'epp.response.msgQ.count'),
        msg_id: util.eval(data, 'epp.response.msgQ.id'),
        msg_date: util.eval(data, 'epp.response.msgQ.qDate'),
        msg_content: util.eval(data, 'epp.response.msgQ.msg')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  poll_delete(id) {
    let defer = Q.defer();
    let xml;

    xml = this.preparateXML.parse('/templates/poll_request.xml', {
      op: 'ack',
      msgID: id
    });

    this.connection.send(xml).then((data) => {
      defer.resolve({
        code: util.eval(data, 'epp.response.result.code'),
        message: util.eval(data, 'epp.response.result.msg.$t')
      });
    }).catch(defer.reject);

    return defer.promise;
  }

  //**
  //* Hello
  //*
  hello() {
    let defer = Q.defer();
    let xml = this.preparateXML.parse('/templates/hello.xml');

    this.connection.hello(xml).then((data) => {
      defer.resolve({ message: 'Hello success!' });
    });

    return defer.promise;
  }
}

module.exports = Epp;
