const pg = require('pg');
const config = require('config');

const client = new pg.Client({
  connectionString: config.get('DATABASE_URL'),
});

const clientsTableCleanupQuery = `DROP TABLE IF EXISTS clients CASCADE;`;
const driversTableCleanupQuery = `DROP TABLE IF EXISTS drivers CASCADE;`;

const createTimestampFunction = `CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_time = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

const clientsTableCreationQuery = `CREATE TABLE clients (
  client_id serial PRIMARY KEY,
  facebook_id varchar(100) UNIQUE NOT NULL,
  client_state varchar(50) NOT NULL DEFAULT 'ACTIVE',
  birth_date date,
  full_address varchar(200),
  full_name varchar(100),
  phone_number varchar(30),
  created_time timestamp NOT NULL DEFAULT NOW()
);`;

const driversTableCreationQuery = `CREATE TABLE drivers (
  driver_id serial PRIMARY KEY,
  facebook_id varchar(100) UNIQUE NOT NULL,
  driver_state varchar(50) NOT NULL DEFAULT 'AVAILABLE',
  created_time timestamp NOT NULL DEFAULT NOW()
);`;

const cleanupQueries = [clientsTableCleanupQuery, driversTableCleanupQuery];
const creationQueries = [createTimestampFunction, clientsTableCreationQuery, driversTableCreationQuery];
const queriesToRun = cleanupQueries.concat(creationQueries);

runQueries();

async function runQueries() {
  await client.connect();
  for (let index = 0; index < queriesToRun.length; index++) {
    try {
      let res = await client.query(queriesToRun[index]);
      console.log('Query executed successfully: %j', res);
    } catch (err) {
      console.log('Error executing query: %j', err);
    }
  }
  await client.end();
}
