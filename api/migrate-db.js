const db = require('./db.js');

async function migrate() {
  try {
    const [res] = await db.query(
      "ALTER TABLE runners MODIFY COLUMN status ENUM('Ativo', 'Inativo', 'Aposentado') NOT NULL DEFAULT 'Ativo'"
    );
    console.log('Migration status change successful:', res);
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
