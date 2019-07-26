CREATE TABLE metaTable (
	ProduceID varchar(255),
    Farmer varchar(255),
    Farm varchar(255),
    Produce varchar(255),
    Unit varchar(255),
    FarmBio longtext,
    Website text
);

INSERT INTO metaTable
VALUES ('OCFMNATORGBEET01','Skye Fehlmann', 'Naturally Organic', 'Beetroot Red and Golden Bunch',  'Bunch', 'Naturally Organic is a local family-run Organic Farm in Phillippi, Cape Town, that has been producing delicious fresh products for wholesale and retail since 2005.About twenty minutes from the city centre, Phillippi is a unique horticultural area because of the close proximity to the city and the famous aquifer that sustains the 2500 hectares of farmlands. We strive to make the most of everything the great outdoors has to offer. Our products are fresh from the field, so you can be sure you are buying the best quality produce.',	'https://www.naturallyorganic.co.za/');

INSERT INTO metaTable
VALUES ('OCFMBOSFARKUMQ01', 'Boschendal Farmers', 'Boschendal Farm', 'Kumquats', 'Kg', 'A place where grass-fed Angus cattle, forest-fed pigs and free range chickens work alongside our farmers to replenish and revitalise the soils. It is a place where our ducks help gardeners grow exquisite bio-dynamic produce for our two restaurants – we very much like the idea of farming and cooking with nature, and not against it. It is a place where guests can swim in our dams and feel comfortable picking fruit from our orchards – we like sharing our extraordinary produce.',	'https://www.boschendal.com/the-farm');

INSERT INTO metaTable
VALUES ('OCFMARLVANCOUR01', 'Arlene Van Wyk', ' ', 'Marrows Baby (courgettes)',	'Kg', 'NA', 'NA');

INSERT INTO metaTable
VALUES ('OCFMSABFARPEAS01', 'Sababa Farmers', 'Sababa Farm', 'Peas Mange Tout (Flat)',	'Kg', 'Sababa is part of a worldwide movement towards regenerative agriculture. We draw on various different approaches to deliver the highest quality, ecologically friendly, ethically grown food. Specialising in a variety of crops, we aim to increase biodiversity, improve the health of our soils, and experiment with new techniques in improving efficiency and sustainability for both commercial and subsistence agriculture.',	'http://sababafarm.co.za/');

INSERT INTO metaTable
VALUES ('OCFMNUYVALPUMP01', 'Nuy Valley Farmers', 'Nuy Valley',	'Pumpkin Crown Prince',	'Kg', 'NA', 'NA');	

INSERT INTO metaTable
VALUES ('OCFMROSFARTOMA01', 'Clare Kuiper',	'Rosenhof Farm',	'Tomatoes Yellow',	'Kg',	'On Rosenhof Farm, we’re passionate about reversing the industrialisation of our food and the pollution of the land that nurtures it. We grow apples and pears ( which are in conversion to an organic programme ), raspberries, free-range chickens, and organic fruit and vegetables .',	'https://www.rosenhoffarm.co.za/contact');

INSERT INTO metaTable
VALUES ('OCFMBERFARORAN01', 'Margaret Ann McGregor', 'Bergsoom Farm', 'Oranges Cara Cara (Bags of 2,5kg)', 'Bag', 'Margaret McGregor, from Bergsoom Farm in Citrusdal in the Western Cape, is involved in the small family-run farm which has been operating for more than 30 years.', 'NA');

INSERT INTO metaTable
VALUES ('OCFMBERFARGRAF01', 'Margaret Ann McGregor', 'Bergsoom Farm', 'Grapefruit Ruby (4kg bags)', 'Bag', 'Margaret McGregor, from Bergsoom Farm in Citrusdal in the Western Cape, is involved in the small family-run farm which has been operating for more than 30 years.', 'NA');

INSERT INTO metaTable
VALUES ('OCFMBERFARGNAAR01', 'Margaret Ann McGregor', 'Bergsoom Farm', 'Naartjies Nadorcott (2,3kg bags)', 'Bag', 'Margaret McGregor, from Bergsoom Farm in Citrusdal in the Western Cape, is involved in the small family-run farm which has been operating for more than 30 years.', 'NA');

INSERT INTO metaTable
VALUES ('OCFMWHIMOURADI01', 'Francois Malan',	'White Mountain',	'Radish Cherry Belle 150g',	'Bunch',	'A 2 ha family run farm producing organic vegetables. Henriette and Francois Malans biodynamic farm is on the outskirts of Wolseley in the Breede River Valley. The couple use organic methods of crop rotation, natural methods to build soil fertility, green manures and recently they have experimented with using homeopathic remedies (Francois brother is a homeopath) and have found them to be effective - such as using Silica applied at every moon Saturns opposition.', 'https://wmnpweb.wixsite.com/whitemountainnp?fbclid=IwAR253q5N0kas_2VQ6MsTOQ6ijsDZZ6bgzmqWQfsKh_u3P2E9hlQWkKtfep4');

CREATE TABLE harvest (
        counter int NOT NULL AUTO_INCREMENT,
        ID varchar(255),
        supplierID varchar(255),
        supplierAddress varchar(255),
        productID varchar(255),
        photoHash varchar(255),
        harvestTimeStamp varchar(255),
        harvestCaptureTime varchar(255),
        harvestDescription varchar(255),
        geolocation varchar(255),
        supplierproduce varchar(255),
        PRIMARY KEY (counter)
);

INSERT INTO harvest (
        ID ,
        supplierID,
        supplierAddress,
        productID,
        photoHash,
        harvestTimeStamp,
        harvestCaptureTime,
        harvestDescription,
        geolocation,
        supplierproduce)
VALUES ('2', 'inputSupplier',	'0x874950b8c006e6d166f015236623fcd0c0a7dc75',	'inputProduct',	'inputPhoto',	'2019-07-05 09:25', '2019-07-06 10:25', 'description', 'geolocation', 'OranjezichtCityFarm_Apples');


-- return instance.registerHarvest("2", inputSupplier, "0x874950b8c006e6d166f015236623fcd0c0a7dc75", inputProduct, inputPhoto, momentHarvestTime, momentInputDataTime, solidityContext);


CREATE TABLE storage (
        counter int NOT NULL AUTO_INCREMENT,
        ID varchar(255),
        marketID varchar(255),
        marketAddress varchar(255),
        quantity varchar(255),
        unitOfMeasure varchar(255),
        storageTimeStamp varchar(255),
        storageCaptureTime varchar(255),
        URL varchar(255),
        hashID varchar(255),
        storageDescription varchar(255),
        geolocation varchar(255),
        supplierproduce varchar(255),
        PRIMARY KEY (counter)
);

-- return instance.registerStorage("2", inputSupplierStorage, "0x874950b8c006e6d166f015236623fcd0c0a7dc75", inputQuantityStorage, inputUoMStorage, momentInputStorageTime,  momentInputDataTimeStorage, "www.uct.ac.za", "test hash 1234", solidityContext);

INSERT INTO storage (
        ID,
        marketID,
        marketAddress,
        quantity,
        unitOfMeasure,
        storageTimeStamp,
        storageCaptureTime,
        URL,
        hashID,
        storageDescription,
        geolocation,
        supplierproduce)
VALUES ('2', 'inputMarket',	'0x874950b8c006e6d166f015236623fcd0c0a7dc75',	'inputQuantityStorage', 'inputUoMStorage',	'2019-07-05 09:25', '2019-07-06 10:25', 'url', 'hashid', 'description', 'geolocation', 'OranjezichtCityFarm_Apples');

-- return harvest and storage data for QRCode view
SELECT
	s.counter,
	s.ID,
	s.marketID,
	s.marketAddress,
	s.quantity,
	s.unitOfMeasure,
	s.storageTimeStamp,
	s.storageCaptureTime,
	s.URL,
	s.hashID,
	s.storageDescription,
	s.geolocation,
	s.supplierproduce,
	h.supplierID,
	h.supplierAddress,
	h.productID,
	h.photoHash,
	h.harvestTimeStamp,
	h.harvestCaptureTime,
	h.harvestDescription,
	h.geolocation
FROM
	storage s
INNER JOIN
	harvest h
ON
	s.supplierproduce = h.supplierproduce
WHERE
	s.supplierproduce = 'OranjezichtCityFarm_Apples' AND
	h.counter = (SELECT max(counter) FROM harvest where supplierproduce = 'OranjezichtCityFarm_Apples') AND
    s.counter = (SELECT max(counter) FROM storage where supplierproduce = 'OranjezichtCityFarm_Apples');