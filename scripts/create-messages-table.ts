import 'dotenv/config';
import mariadb from 'mariadb';

async function main() {
  const url = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/cathedis_parc';
  const parsed = new URL(url);
  
  const pool = mariadb.createPool({
    host: parsed.hostname || 'localhost',
    port: parseInt(parsed.port || '3306'),
    user: parsed.username || 'root',
    password: decodeURIComponent(parsed.password || ''),
    database: parsed.pathname.replace('/', '') || 'cathedis_parc',
    connectionLimit: 5
  });

  const conn = await pool.getConnection();
  console.log('Connected to MySQL/MariaDB database successfully!');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      content TEXT NOT NULL,
      senderId VARCHAR(191) NOT NULL,
      receiverId VARCHAR(191) NOT NULL,
      \`read\` BOOLEAN NOT NULL DEFAULT false,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX idx_messages_participants (senderId, receiverId),
      INDEX idx_messages_unread (receiverId, \`read\`),
      CONSTRAINT fk_messages_sender FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_messages_receiver FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  console.log('TABLE messages CREATED OR VERIFIED SUCCESSFULLY!');
  conn.release();
  await pool.end();
  process.exit(0);
}

main().catch(err => {
  console.error('Error creating messages table:', err);
  process.exit(1);
});
