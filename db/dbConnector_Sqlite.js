const sqlite3 = require('sqlite3').verbose();
const { open } = require("sqlite");

async function connect() {
  return open({
    filename: "./db/emailManagement.db",
    driver: sqlite3.Database,
  });
}

async function verifyLogin(username, password) {
  const db = await connect();
  const user = await db.get(
    "SELECT * FROM Users WHERE username = ? AND password = ?;", [username, password]
  );
  await db.close();
  // console.log(user);
  return user;
}

//查看接收邮件
async function checkReceivedEmails(user_id) {
  const db = await connect();
  const emails = await db.all(`
    SELECT e.* 
    FROM Emails e 
    INNER JOIN EmailFolderMapping efm ON e.email_id = efm.email_id 
    INNER JOIN Folders f ON efm.folder_id = f.folder_id 
    WHERE e.receiver_id = ? 
    AND f.folderName = 'sent'`, [user_id]
  );
  await db.close();
  // console.log(emails);
  return emails;
}

//查看草稿箱邮件
async function checkDrafts(user_id) {
  const db = await connect();
  const emails = await db.all(
    `SELECT e.* FROM Emails e 
    INNER JOIN EmailFolderMapping efm ON e.email_id = efm.email_id 
    INNER JOIN Folders f ON efm.folder_id = f.folder_id 
    WHERE e.sender_id = ? 
    AND f.folderName = 'draft'`, [user_id]
  );
  await db.close();
  // console.log(emails);
  return emails;
}

//查看已删除邮件
async function checkDeletedemails(user_id) {
  const db = await connect();
  const emails = await db.all(
    `SELECT e.* FROM Emails e 
    INNER JOIN EmailFolderMapping efm ON e.email_id = efm.email_id 
    INNER JOIN Folders f ON efm.folder_id = f.folder_id 
    WHERE e.sender_id = ? 
    AND f.folderName = 'deleted'`, [user_id]
  );
  await db.close();
  // console.log(emails);
  return emails;
}


async function findemail(email_id) {
  const db = await connect();
  const email = await db.get(
    "SELECT * FROM Emails WHERE email_id = ?;", [email_id]
  );
  await db.close();
  return email;
}

//查看垃圾邮件

async function checktrashemails(user_id) {
  const db = await connect();
  const emails = await db.all(
    `SELECT e.* FROM Emails e 
    INNER JOIN EmailFolderMapping efm ON e.email_id = efm.email_id 
    INNER JOIN Folders f ON efm.folder_id = f.folder_id 
    WHERE e.sender_id = ? 
    AND f.folderName = 'trash'`, [user_id]
  );
  await db.close();
  // console.log(emails);
  return emails;
}

//查看垃圾邮件
async function checksentemails(user_id) {
  const db = await connect();
  const emails = await db.all(
    `SELECT e.* FROM Emails e 
    INNER JOIN EmailFolderMapping efm ON e.email_id = efm.email_id 
    INNER JOIN Folders f ON efm.folder_id = f.folder_id 
    WHERE e.sender_id = ? 
    AND f.folderName = 'trash'`, [user_id]
  );
  // console.log(emails);
  await db.close();
  return emails;
}

// 在 dbConnector_Sqlite.js 中添加批量删除邮件的函数
async function deleteEmails(emailIds) {
  const db = await connect();
  let successCount = 0;

  // 开始数据库事务
  await db.exec("BEGIN TRANSACTION");

  try {
    // 删除邮件表中的记录
    const emailDeleteStmt = await db.prepare(`
      DELETE FROM Emails
      WHERE email_id = ?
    `);

    for (const emailId of emailIds) {
      await emailDeleteStmt.run(emailId);
    }

    await emailDeleteStmt.finalize();

    // 删除 EmailFolderMapping 表中的记录
    const mappingDeleteStmt = await db.prepare(`
      DELETE FROM EmailFolderMapping
      WHERE email_id = ?
    `);

    for (const emailId of emailIds) {
      await mappingDeleteStmt.run(emailId);
    }

    await mappingDeleteStmt.finalize();

    // 提交数据库事务
    await db.exec("COMMIT");

    successCount = emailIds.length;
  } catch (error) {
    // 如果出现错误，回滚事务
    await db.exec("ROLLBACK");
    throw error;
  } finally {
    // 关闭数据库连接
    await db.close();
  }

  return successCount; // 返回成功删除的邮件数量
}

//查看分类
async function checkFolders(user_id) {
  const db = await connect();
  const folders = await db.all(
    `SELECT f.* FROM Folders f 
    WHERE f.user_id = ? 
    AND f.folderName NOT IN ('trash', 'delete', 'draft', 'sent')`, [user_id]
  );
  await db.close();
  return folders;
}

//查看联系人
async function checkContacts(user_id) {
  const db = await connect();
  const contacts = await db.all(
    `SELECT * 
    FROM Connects 
    WHERE user_id = ?;`, [user_id]
  );
  await db.close();
  return contacts;
}

//获取收件人
async function getReceiver(receiver) {
  const db = await connect();
  const receiver_id = await db.get(
    `SELECT user_id 
    FROM Users 
    WHERE email = ?;`, [receiver]
  );
  await db.close();
  return receiver_id
}


//发送邮件
async function sendemail(title, sender_id, created_time, sending_time, content,  receiver_id) {
  const db = await connect();
  const email = await db.all(
    `INSERT INTO Emails (title, sender_id, created_time, sending_time, content,  receiver_id)
    VALUES (?, ?, ?, ?, ?, ?);
    `, [title, sender_id, created_time, sending_time, content,  receiver_id]
  );
  await db.close();
}

// Function to add a new contact to the Connects table
async function addContact(username, email, phone, address, birthday, userId) {
  const db = await connect();

  // Insert the contact data into the Connects table
  await db.run(`
    INSERT INTO Connects (username, email, phone, address, birthday, user_id)
    VALUES (?, ?, ?, ?, ?, ?);
  `, [username, email, phone, address, birthday, userId]);

  // Close the database connection
  await db.close();
}


module.exports = {
  // 登录验证函数
  verifyLogin,
  checkReceivedEmails,
  checkDrafts,
  findemail,
  checkDeletedemails,
  checktrashemails,
  checksentemails,
  deleteEmails,
  checkFolders,
  checkContacts,
  addContact,
  sendemail,
  getReceiver,
};