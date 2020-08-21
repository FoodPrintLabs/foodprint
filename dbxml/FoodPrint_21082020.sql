--  =============================================
-- Author:      Julian Kanjere
-- Create date: 21 August 2020
-- Description: Add columns year_established and covid19_response to harvest logbook


ALTER TABLE foodprint_harvest 
ADD year_established varchar(255),
ADD covid19_response varchar(255);