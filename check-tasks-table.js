const mysql = require('mysql2');

// Database connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'social_developer'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
  
  // Get table structure
  connection.query('DESCRIBE tasks', (err, results) => {
    if (err) {
      console.error('Error describing tasks table:', err);
      connection.end();
      return;
    }
    
    console.log('Tasks table structure:');
    console.table(results);
    
    connection.end();
  });
});