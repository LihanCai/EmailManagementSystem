// 在 dbConnector_Sqlite.js 中添加批量删除邮件的函数
async function deleteEmails(emailIds) {
  const db = await connect();
  const successCount = await db.run(`
    DELETE FROM Emails
    WHERE email_id IN (${emailIds.map(id => '?').join(', ')})
  `, emailIds);

  return successCount.changes; // 返回成功删除的邮件数量
}
