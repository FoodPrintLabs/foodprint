-- =============================================
-- Author:      Julian Kanjere
-- Create date: 18 November 2019
-- Description: Script to create Config tables


-- Config, Farm, Smart Contract,  TraceProduce, Produce, FarmUser, FarmProduce, Market, MarketUser,
-- Harvest (include hash column, added_to_blockchain, blockchain_date, blockchain_by, verifiable_on_blockchain.
--         write to DB then Add to Blockchain fxn which also stores the contract address and uses latest contract by default),
-- Storage (write to DB then Add to Blockchain fxn), Weekly View (choose market then display),
-- CheckInCount ( when scan check in QR - time, market, device type, unique id),
-- CheckInEmail, ScanQRCount
-- =============================================


--user groups: superuser, admin, farmer, market, consumer
CREATE TABLE foodprint_usergroups (
        pk int NOT NULL AUTO_INCREMENT,
        logid varchar(255),
        groupname varchar(255),
        grouplabel varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_usergroups (
        logid ,
        groupname,
        grouplabel,
        logdatetime)
VALUES
  ('1', 'superuser',	'Super User',	'2019-11-18 09:25'),
  ('2', 'admin',	'Administrator',	'2019-11-18 09:25'),
  ('3', 'farmer',	'Farmer',	'2019-11-18 09:25'),
  ('4', 'market',	'Market',	'2019-11-18 09:25'),
  ('5', 'consumer',	'Consumer',	'2019-11-18 09:25');


--track scans of qr codes
CREATE TABLE foodprint_qrcount (
        pk int NOT NULL AUTO_INCREMENT,
        logid varchar(255),
        qrid varchar(255),
        qrurl varchar(255),
        marketid varchar(255),
        request_host varchar(255), --req.headers.host;
        request_origin varchar(255), --req.headers.origin;
        request_useragent varchar(500), --req.useragent from https://www.npmjs.com/package/express-useragent;
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_qrcount (
        logid ,
        qrid,
        qrurl,
        marketid,
        request_host,
        request_origin,
        request_useragent,
        logdatetime)
VALUES ('1', '1', 'http://www.foodprintapp.com/checkin/ozcf', 'OZCF',	'host',	'origin', 'useragent',	'2019-11-18 09:25');


--manage qr codes
CREATE TABLE foodprint_qr (
        pk int NOT NULL AUTO_INCREMENT,
        qrid varchar(255),
        marketid varchar(255),
        qrname varchar(255),
        qrlabel varchar(255),
        qrurl varchar(255),
        qrcode varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_qr (
        qrid ,
        marketid,
        qrname,
        qrlabel,
        qrurl,
        qrcode,
        logdatetime)
VALUES ('1', 'OZCF',	'Check-in',	'Your journey starts here', 'http://www.foodprintapp.com/checkin/ozcf','qrcode',	'2019-11-18 09:25');


--manage markets on platform
CREATE TABLE foodprint_market (
        pk int NOT NULL AUTO_INCREMENT,
        marketid varchar(255),
        marketname varchar(255),
        marketdescription varchar(750),
        marketcode varchar(255),
        marketemail varchar(255),
        marketphone varchar(255),
        marketcell varchar(255),
        marketlongitude varchar(255),
        marketlatitude varchar(255),
        marketaddress varchar(255),
        marketcity varchar(255),
        marketcountry varchar(255),
        markettimes varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_market (
        marketid ,
        marketname,
        marketdescription,
        marketcode,
        marketemail,
        marketphone,
        marketcell,
        marketlongitude,
        marketlatitude,
        marketaddress,
        marketcity,
        marketcountry,
        markettimes,
        logdatetime)
VALUES ('1', 'Oranjezicht City Farm Market',	'Held every Saturday, Sunday and Wednesday at the historic Granger Bay site of the V&A Waterfront, the OZCF Market is a community farmers-style market for independent local farmers and artisanal food producers. At the OZCF Market customers can do weekly food shopping (veg, fruit, bread, organic dairy, free-range eggs, honey, muesli etc), try out some delicious cooked and raw foods and be inspired about helping to build an alternative food system.  Additionally, customers can buy edible plants and seedlings, compost and gardening supplies and equipment.',
'OZCF',	'email', 'phone', 'cell', 'longitude', 'latitude', 'address', 'Cape Town', 'South Africa',
'Saturday 8.15am to 2pm, Sunday 9am to 3pm and Wednesday 4 to 8pm (all weather)', '2019-11-18 09:25');


--users allocated to market
CREATE TABLE foodprint_marketuser (
        pk int NOT NULL AUTO_INCREMENT,
        marketid varchar(255),
        userid varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_marketuser (
        marketid ,
        userid,
        logdatetime)
VALUES ('1', 'OZCF',	'OZCF_User1',	'2019-11-18 09:25');


--manage farms on platform
CREATE TABLE foodprint_farm (
        pk int NOT NULL AUTO_INCREMENT,
        farmid varchar(255),
        farmname varchar(255),
        farmdescription varchar(750),
        farmcode varchar(255),
        farmemail varchar(255),
        farmphone varchar(255),
        farmcell varchar(255),
        farmlongitude varchar(255),
        farmlatitude varchar(255),
        farmaddress varchar(255),
        farmcity varchar(255),
        farmcountry varchar(255),
        farmtimes varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_farm (
        farmid ,
        farmname,
        farmdescription,
        farmcode,
        farmemail,
        farmphone,
        farmcell,
        farmlongitude,
        farmlatitude,
        farmaddress,
        farmcity,
        farmcountry,
        farmtimes,
        logdatetime)
VALUES ('1', 'Oranjezicht City Farm',	'The Oranjezicht City Farm (OZCF) is a non-profit project celebrating local food, culture and community through urban farming in Cape Town. It is located next to the corner of Sidmouth Avenue and Upper Orange Street, Oranjezicht, adjacent to Homestead Park.',
'OZCF',	'email', 'phone', 'cell', 'longitude', 'latitude', 'address', 'Cape Town', 'South Africa',
'The Farm is open weekdays from 08h00 to 16h00 and Saturdays from 08h00 to 13h00 (closed on Sundays). If you want to wander around on your own, you are very welcome.',
 '2019-11-18 09:25');


--manage produce
CREATE TABLE foodprint_farmproduce (
        pk int NOT NULL AUTO_INCREMENT,
        produceid varchar(255),
        producename varchar(255),
        producedescription varchar(255),
        producepicture varchar(255),
        farmid varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_farmproduce (
        produceid ,
        producename,
        producedescription,
        producepicture,
        farmid,
        logdatetime)
VALUES ('1', 'Yellow Tomatoes',	'ProduceDescription',	'img/fruitCatalogue/yellowtomatoes.jpg', 'Rosenhof Farm',	'2019-11-18 09:25');


--users allocated to farms
CREATE TABLE foodprint_farmuser (
        pk int NOT NULL AUTO_INCREMENT,
        farmid varchar(255),
        userid varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_farmuser (
        farmid ,
        userid,
        logdatetime)
VALUES ('1', 'OZCF',	'Farm_User1',	'2019-11-18 09:25');


--produce master data e.g. orange then farmproduce can be cara cara orange
CREATE TABLE foodprint_produce (
        pk int NOT NULL AUTO_INCREMENT,
        produceid varchar(255),
        producename varchar(255),
        producedescription varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_produce (
        produceid ,
        producename,
        producedescription,
        logdatetime)
VALUES ('1', '1',	'orange',	'fruit',	'2019-11-18 09:25');


--version control of deployed smart contracts
CREATE TABLE foodprint_smartcontract (
        pk int NOT NULL AUTO_INCREMENT,
        contract_name varchar(255),
        contract_description varchar(255),
        contract_address varchar(255),
        dlt_type varchar(255),
        dlt_network varchar(255),
        deploydatetime DATETIME,
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_smartcontract (
        contract_name ,
        contract_description,
        contract_address,
        dlt_type,
        dlt_network,
        deploydatetime,
        logdatetime)
VALUES ('FoodPrint v1', 'Produce and Harvest stored in DB and Blockchain',	'address', 'Blockchain',
	    'kovan', '2019-08-18 09:25',	'2019-11-18 09:25');


--catch all key:value configuration
CREATE TABLE foodprint_config (
        pk int NOT NULL AUTO_INCREMENT,
        configid varchar(255),
        configname varchar(255),
        configdescription varchar(255),
        configvalue varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_config (
        configid ,
        configname,
        configdescription,
        configvalue,
        logdatetime)
VALUES ('1', 'testemail',	'override email',	'test@afriwebhub.co.za',	'2019-11-18 09:25');


-- manage subscriptions to market after user check-in
CREATE TABLE market_subscription (
        pk int NOT NULL AUTO_INCREMENT,
        market_id varchar(255),
        firstname varchar(255),
        surname varchar(255),
        email varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO market_subscription (
        market_id ,
        firstname,
        surname,
        email,
      logdatetime)
VALUES ('OZCF', '',	'',	'test@afriwebhub.co.za',	'2019-11-16 09:25');


--subscription to FoodPrint via home page
CREATE TABLE foodprint_subscription (
        pk int NOT NULL AUTO_INCREMENT,
        firstname varchar(255),
        surname varchar(255),
        email varchar(255),
        logdatetime DATETIME,
        PRIMARY KEY (pk)
);

INSERT INTO foodprint_subscription (
        firstname,
        surname,
        email,
        logdatetime)
VALUES ('TestName',	'TestSurname',	'test@afriwebhub.co.za',	'2019-11-18 09:25');