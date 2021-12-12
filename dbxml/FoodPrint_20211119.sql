--  =============================================
-- Author:      Tatenda
-- Create date: 19 November 2021
-- Description: change data type for harvest_TimeStamp and harvest_CaptureTime on table foodprint_weeklyview from string to date

ALTER TABLE foodprint_weeklyview MODIFY harvest_TimeStamp datetime DEFAULT NULL;
ALTER TABLE foodprint_weeklyview MODIFY harvest_CaptureTime datetime DEFAULT NULL;
