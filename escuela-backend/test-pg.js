const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres123',
    database: 'escuela_db',
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected successfully!');

    const result = await client.query('SELECT current_user, current_database()');
    console.log('Result:', result.rows[0]);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
