--  =============================================
-- Author:      Chaddy Rungwe
-- Create date: 10 November 2021
-- Description: added nationalIdPhotoHash column to store national id for registered users

ALTER TABLE user
ADD nationalIdPhotoHash LONGBLOB;