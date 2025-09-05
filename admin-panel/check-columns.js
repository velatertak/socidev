const mysql = require('mysql2');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'social_developer'
});

// Query to get column names
connection.query('SHOW COLUMNS FROM users', (error, results) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Users table columns:');
  results.forEach(row => {
    console.log(`- ${row.Field} (${row.Type})`);
  });
  
  connection.end();
});