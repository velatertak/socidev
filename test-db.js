const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'social_developer'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database successfully!');
  
  // Test query
  connection.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return;
    }
    console.log('Query result:', results[0].solution);
    connection.end();
  });
});