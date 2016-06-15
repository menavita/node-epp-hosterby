# node-epp-hosterby
Модуль для работы с EPP-сервером технического регистратора доменов .by и .бел

##Пример
```
var HosterBY = require('node-epp-hosterby');

var credential = {
  "ssl": false,
  "port": 700,
  "host": "epp.hoster.by",
  "login": "<login>",
  "password": "<password>"
};

var hoster = new HosterBY(credential);

// Проверка домена старонка.бел
hoster.checkDomain('старонка.бел').then(function(result){ ... });
// Регистрация домена старонка.бел для регистранта 1337 на 2 года с неймсерверами ns1.staronka.by и ns2.staronka.by
hoster.createDomain('старонка.бел', 1337, 2, ['ns1.staronka.by', 'ns2.staronka.by']).then(function(result){ ... });
// Продление домена старонка.бел
hoster.renewDomain('старонка.бел', 1).then(function(result){ ... });

// Создание регистранта
hoster.createContact(contact['entrepreneur']).then(function(result){ ... });
// Информация о регистранте
hoster.infoContact(1337).then(function(result){ ... });
// Обновление данных регистранта
hoster.updateContact(1337, contact['entrepreneur']).then(function(result){ ... });

// Формат данных регистранта зависит от его типа (частное лицо, компания, ИП)
var contact = {
  'private': {
    "contactId": "auto",
    "contactPostalInfoName": info.name,
    "contactPostalInfoAddrStreet": postal.street,
    "contactPostalInfoAddrCity": postal.city,
    "contactPostalInfoAddrPC": postal.zip,
    "contactPostalInfoAddrCC": postal.country,
    "contactVoice": info.phone.replace(/[\s\+\(\)-]/g, ""),
    "contactEmail": info.email,
    "extensionType": "person",
    "extensionPassportPersonalnmbr": passport.uid,
    "extensionPassportSer": passport.series,
    "extensionPassportNmbr": passport.number,
    "extensionPassportOrg": passport.issued,
    "extensionPassportDate": moment(passport.date).format('YYYY-MM-DD')
  },
  'company': {
    "contactId": "auto",
    "contactPostalInfoOrg": org.name,
    "contactPostalInfoName": org.chief,
    "contactPostalInfoAddrStreet": postal.street,
    "contactPostalInfoAddrCity": postal.city,
    "contactPostalInfoAddrPC": postal.zip,
    "contactPostalInfoAddrCC": postal.country,
    "contactVoice": info.phone.replace(/[\s\+\(\)-]/g, ""),
    "contactEmail": info.email,
    "extensionType": "organization",
    "extensionUNP": org.taxnumber,
    "extensionErgNumber": org.taxnumber,
    "extensionErgOrg": org.reg.issued,
    "extensionErgResh": org.reg.number,
    "extensionErgDate": moment(org.reg.date).format('YYYY-MM-DD')
  },
  'entrepreneur': {
    "contactId": "auto",
    "contactPostalInfoName": info.name,
    "contactPostalInfoAddrStreet": postal.street,
    "contactPostalInfoAddrCity": postal.city,
    "contactPostalInfoAddrPC": postal.zip,
    "contactPostalInfoAddrCC": postal.country,
    "contactVoice": info.phone.replace(/[\s\+\(\)-]/g, ""),
    "contactEmail": info.email,
    "extensionType": "ip",
    "extensionUNP": org.taxnumber,
    "extensionPassportPersonalnmbr": passport.uid,
    "extensionPassportSer": passport.series,
    "extensionPassportNmbr": passport.number,
    "extensionPassportOrg": passport.issued,
    "extensionPassportDate": moment(passport.date).format('YYYY-MM-DD')
  }
};