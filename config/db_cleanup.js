const pg = require('pg');
const config = require('config');

const pool = new pg.Pool({
  connectionString: config.get('DATABASE_URL'),
});

const cleanupQuery = `TRUNCATE clients, drivers;`;

async function cleanupTables() {
  const client = await pool.connect();
  try {
    await client.query(cleanupQuery);
  } catch (err) {
    console.error(err);
  }
  client.release();
}

module.exports = cleanupTables;
