-- join of at least three tables
SELECT e.* 
FROM Emails e 
INNER JOIN EmailFolderMapping efm 
ON e.email_id = efm.email_id 
INNER JOIN Folders f 
ON efm.folder_id = f.folder_id 
WHERE e.sender_id = 1 
AND f.folderName = 'sent';


-- Subquery
SELECT username, email 
FROM Users 
WHERE user_id IN (
    SELECT sender_id 
    FROM Emails 
    WHERE sender_id = '1'
);

-- GROUP BY with HAVING clause
SELECT sender_ID, COUNT(email_id) as TotalEmails 
FROM Emails 
GROUP BY sender_ID 
HAVING COUNT(email_id) > 5;

-- Advanced query using SELECT CASE/WHEN
SELECT email_id, title,
CASE 
    WHEN sending_time < '2023-01-01' THEN 'Old Email'
    WHEN sending_time >= '2023-01-01' AND sending_time <= '2023-12-31' THEN 'Email from 2023'
    ELSE 'Future Email'
END as EmailType 
FROM Emails;
