CREATE DATABASE  IF NOT EXISTS `foodprint` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `foodprint`;
-- MySQL dump 10.13  Distrib 8.0.22, for macos10.15 (x86_64)
--
-- Host: localhost    Database: foodprint
-- ------------------------------------------------------
-- Server version	8.0.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `foodprint_config`
--

DROP TABLE IF EXISTS `foodprint_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_config` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `configid` varchar(255) DEFAULT NULL,
  `configname` varchar(255) DEFAULT NULL,
  `configdescription` varchar(255) DEFAULT NULL,
  `configvalue` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_farm`
--

DROP TABLE IF EXISTS `foodprint_farm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_farm` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `farmid` varchar(255) DEFAULT NULL,
  `farmname` varchar(255) DEFAULT NULL,
  `farmdescription` varchar(750) DEFAULT NULL,
  `farmcode` varchar(255) DEFAULT NULL,
  `farmemail` varchar(255) DEFAULT NULL,
  `farmphone` varchar(255) DEFAULT NULL,
  `farmcell` varchar(255) DEFAULT NULL,
  `farmlongitude` varchar(255) DEFAULT NULL,
  `farmlatitude` varchar(255) DEFAULT NULL,
  `farmaddress` varchar(255) DEFAULT NULL,
  `farmcity` varchar(255) DEFAULT NULL,
  `farmcountry` varchar(255) DEFAULT NULL,
  `farmtimes` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_farmproduce`
--

DROP TABLE IF EXISTS `foodprint_farmproduce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_farmproduce` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `produceid` varchar(255) DEFAULT NULL,
  `producename` varchar(255) DEFAULT NULL,
  `producedescription` varchar(255) DEFAULT NULL,
  `producepicture` varchar(255) DEFAULT NULL,
  `farmid` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_farmuser`
--

DROP TABLE IF EXISTS `foodprint_farmuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_farmuser` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `farmid` varchar(255) DEFAULT NULL,
  `userid` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_harvest`
--

DROP TABLE IF EXISTS `foodprint_harvest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_harvest` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `harvest_logid` varchar(255) DEFAULT NULL,
  `harvest_supplierShortcode` varchar(255) DEFAULT NULL,
  `harvest_supplierName` varchar(255) DEFAULT NULL,
  `harvest_farmerName` varchar(255) DEFAULT NULL,
  `harvest_supplierAddress` varchar(255) DEFAULT NULL,
  `harvest_produceName` varchar(255) DEFAULT NULL,
  `harvest_photoHash` longblob,
  `harvest_TimeStamp` datetime DEFAULT NULL,
  `harvest_CaptureTime` datetime DEFAULT NULL,
  `harvest_Description` varchar(1000) DEFAULT NULL,
  `harvest_geolocation` varchar(255) DEFAULT NULL,
  `harvest_quantity` varchar(255) DEFAULT NULL,
  `harvest_unitOfMeasure` varchar(255) DEFAULT NULL,
  `harvest_description_json` varchar(1000) DEFAULT NULL,
  `harvest_BlockchainHashID` varchar(255) DEFAULT NULL,
  `harvest_BlockchainHashData` varchar(2000) DEFAULT NULL,
  `supplierproduce` varchar(255) DEFAULT NULL,
  `harvest_bool_added_to_blockchain` varchar(255) DEFAULT NULL,
  `harvest_added_to_blockchain_date` datetime DEFAULT NULL,
  `harvest_added_to_blockchain_by` varchar(255) DEFAULT NULL,
  `harvest_blockchain_uuid` varchar(255) DEFAULT NULL,
  `harvest_user` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  `lastmodifieddatetime` datetime DEFAULT NULL,
  `year_established` varchar(255) DEFAULT NULL,
  `covid19_response` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=333 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_market`
--

DROP TABLE IF EXISTS `foodprint_market`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_market` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `marketid` varchar(255) DEFAULT NULL,
  `marketname` varchar(255) DEFAULT NULL,
  `marketdescription` varchar(750) DEFAULT NULL,
  `marketcode` varchar(255) DEFAULT NULL,
  `marketemail` varchar(255) DEFAULT NULL,
  `marketphone` varchar(255) DEFAULT NULL,
  `marketcell` varchar(255) DEFAULT NULL,
  `marketlongitude` varchar(255) DEFAULT NULL,
  `marketlatitude` varchar(255) DEFAULT NULL,
  `marketaddress` varchar(255) DEFAULT NULL,
  `marketcity` varchar(255) DEFAULT NULL,
  `marketcountry` varchar(255) DEFAULT NULL,
  `markettimes` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_marketuser`
--

DROP TABLE IF EXISTS `foodprint_marketuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_marketuser` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `marketid` varchar(255) DEFAULT NULL,
  `userid` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_produce`
--

DROP TABLE IF EXISTS `foodprint_produce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_produce` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `produceid` varchar(255) DEFAULT NULL,
  `producename` varchar(255) DEFAULT NULL,
  `producedescription` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_qr`
--

DROP TABLE IF EXISTS `foodprint_qr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_qr` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `qrid` varchar(255) DEFAULT NULL,
  `marketid` varchar(255) DEFAULT NULL,
  `qrname` varchar(255) DEFAULT NULL,
  `qrlabel` varchar(255) DEFAULT NULL,
  `qrurl` varchar(255) DEFAULT NULL,
  `qrcode` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_qrcount`
--

DROP TABLE IF EXISTS `foodprint_qrcount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_qrcount` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `logid` varchar(255) DEFAULT NULL,
  `qrid` varchar(255) DEFAULT NULL,
  `qrurl` varchar(255) DEFAULT NULL,
  `marketid` varchar(255) DEFAULT NULL,
  `request_host` varchar(255) DEFAULT NULL,
  `request_origin` varchar(255) DEFAULT NULL,
  `request_useragent` varchar(500) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=2189 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_smartcontract`
--

DROP TABLE IF EXISTS `foodprint_smartcontract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_smartcontract` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `contract_name` varchar(255) DEFAULT NULL,
  `contract_description` varchar(255) DEFAULT NULL,
  `contract_address` varchar(255) DEFAULT NULL,
  `dlt_type` varchar(255) DEFAULT NULL,
  `dlt_network` varchar(255) DEFAULT NULL,
  `deploydatetime` datetime DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_storage`
--

DROP TABLE IF EXISTS `foodprint_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_storage` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `harvest_logid` varchar(255) DEFAULT NULL,
  `harvest_supplierShortcode` varchar(255) DEFAULT NULL,
  `supplierproduce` varchar(255) DEFAULT NULL,
  `storage_logid` varchar(255) DEFAULT NULL,
  `market_Shortcode` varchar(255) DEFAULT NULL,
  `market_Name` varchar(255) DEFAULT NULL,
  `market_Address` varchar(255) DEFAULT NULL,
  `market_quantity` varchar(255) DEFAULT NULL,
  `market_unitOfMeasure` varchar(255) DEFAULT NULL,
  `market_storageTimeStamp` datetime DEFAULT NULL,
  `market_storageCaptureTime` datetime DEFAULT NULL,
  `market_URL` varchar(255) DEFAULT NULL,
  `storage_BlockchainHashID` varchar(255) DEFAULT NULL,
  `storage_BlockchainHashData` varchar(2000) DEFAULT NULL,
  `storage_Description` varchar(255) DEFAULT NULL,
  `storage_bool_added_to_blockchain` varchar(255) DEFAULT NULL,
  `storage_added_to_blockchain_date` datetime DEFAULT NULL,
  `storage_added_to_blockchain_by` varchar(255) DEFAULT NULL,
  `storage_blockchain_uuid` varchar(255) DEFAULT NULL,
  `storage_user` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  `lastmodifieddatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=333 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_subscription`
--

DROP TABLE IF EXISTS `foodprint_subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_subscription` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=1013 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_usergroups`
--

DROP TABLE IF EXISTS `foodprint_usergroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_usergroups` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `logid` varchar(255) DEFAULT NULL,
  `groupname` varchar(255) DEFAULT NULL,
  `grouplabel` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foodprint_weeklyview`
--

DROP TABLE IF EXISTS `foodprint_weeklyview`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foodprint_weeklyview` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `logid` varchar(255) DEFAULT NULL,
  `harvest_logid` varchar(255) DEFAULT NULL,
  `harvest_supplierShortcode` varchar(255) DEFAULT NULL,
  `harvest_supplierName` varchar(255) DEFAULT NULL,
  `harvest_farmerName` varchar(255) DEFAULT NULL,
  `harvest_supplierAddress` varchar(255) DEFAULT NULL,
  `harvest_produceName` varchar(255) DEFAULT NULL,
  `harvest_photoHash` longblob,
  `harvest_TimeStamp` varchar(255) DEFAULT NULL,
  `harvest_CaptureTime` varchar(255) DEFAULT NULL,
  `harvest_Description` varchar(1000) DEFAULT NULL,
  `harvest_geolocation` varchar(255) DEFAULT NULL,
  `harvest_quantity` varchar(255) DEFAULT NULL,
  `harvest_unitOfMeasure` varchar(255) DEFAULT NULL,
  `harvest_description_json` varchar(1000) DEFAULT NULL,
  `harvest_BlockchainHashID` varchar(255) DEFAULT NULL,
  `harvest_BlockchainHashData` varchar(2000) DEFAULT NULL,
  `supplierproduce` varchar(255) DEFAULT NULL,
  `storage_logid` varchar(255) DEFAULT NULL,
  `market_Shortcode` varchar(255) DEFAULT NULL,
  `market_Name` varchar(255) DEFAULT NULL,
  `market_Address` varchar(255) DEFAULT NULL,
  `market_quantity` varchar(255) DEFAULT NULL,
  `market_unitOfMeasure` varchar(255) DEFAULT NULL,
  `market_storageTimeStamp` varchar(255) DEFAULT NULL,
  `market_storageCaptureTime` varchar(255) DEFAULT NULL,
  `market_URL` varchar(255) DEFAULT NULL,
  `storage_BlockchainHashID` varchar(255) DEFAULT NULL,
  `storage_BlockchainHashData` varchar(2000) DEFAULT NULL,
  `storage_Description` varchar(255) DEFAULT NULL,
  `storage_bool_added_to_blockchain` varchar(255) DEFAULT NULL,
  `storage_added_to_blockchain_date` varchar(255) DEFAULT NULL,
  `storage_added_to_blockchain_by` varchar(255) DEFAULT NULL,
  `storage_blockchain_uuid` varchar(255) DEFAULT NULL,
  `harvest_bool_added_to_blockchain` varchar(255) DEFAULT NULL,
  `harvest_added_to_blockchain_date` varchar(255) DEFAULT NULL,
  `harvest_added_to_blockchain_by` varchar(255) DEFAULT NULL,
  `harvest_blockchain_uuid` varchar(255) DEFAULT NULL,
  `harvest_user` varchar(255) DEFAULT NULL,
  `storage_user` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  `lastmodifieddatetime` datetime DEFAULT NULL,
  `year_established` varchar(255) DEFAULT NULL,
  `covid19_response` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=584 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `harvest`
--

DROP TABLE IF EXISTS `harvest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `harvest` (
  `counter` int NOT NULL AUTO_INCREMENT,
  `ID` varchar(255) DEFAULT NULL,
  `supplierID` varchar(255) DEFAULT NULL,
  `supplierAddress` varchar(255) DEFAULT NULL,
  `productID` varchar(255) DEFAULT NULL,
  `photoHash` varchar(255) DEFAULT NULL,
  `harvestTimeStamp` varchar(255) DEFAULT NULL,
  `harvestCaptureTime` varchar(255) DEFAULT NULL,
  `harvestDescription` varchar(255) DEFAULT NULL,
  `geolocation` varchar(255) DEFAULT NULL,
  `supplierproduce` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`counter`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `market_subscription`
--

DROP TABLE IF EXISTS `market_subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `market_subscription` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `market_id` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `logdatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metatable`
--

DROP TABLE IF EXISTS `metatable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metatable` (
  `ProduceID` varchar(255) DEFAULT NULL,
  `Farmer` varchar(255) DEFAULT NULL,
  `Farm` varchar(255) DEFAULT NULL,
  `Produce` varchar(255) DEFAULT NULL,
  `Unit` varchar(255) DEFAULT NULL,
  `FarmBio` longtext,
  `Website` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `storage`
--

DROP TABLE IF EXISTS `storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storage` (
  `counter` int NOT NULL AUTO_INCREMENT,
  `ID` varchar(255) DEFAULT NULL,
  `marketID` varchar(255) DEFAULT NULL,
  `marketAddress` varchar(255) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `unitOfMeasure` varchar(255) DEFAULT NULL,
  `storageTimeStamp` varchar(255) DEFAULT NULL,
  `storageCaptureTime` varchar(255) DEFAULT NULL,
  `URL` varchar(255) DEFAULT NULL,
  `hashID` varchar(255) DEFAULT NULL,
  `storageDescription` varchar(255) DEFAULT NULL,
  `geolocation` varchar(255) DEFAULT NULL,
  `supplierproduce` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`counter`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-08-14 13:45:03


DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) DEFAULT NULL,
  `middleName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `phoneNumber` varchar(255) NOT NULL UNIQUE,
  `role` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `registrationChannel` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;