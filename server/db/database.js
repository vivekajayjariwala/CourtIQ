require('dotenv').config();

const mysql = require('mysql2');

// Create a connection using environment variables
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Connect to database
connection.connect(function(err) {
    if (err) throw err;
    console.log('Database connected successfully!');
});

// Export the connection
module.exports = connection;
