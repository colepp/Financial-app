
// postgresql reqs
const {Pool} = require('pg');


// Load .env file varieables into process
require('dotenv').config();

console.log("Database host:", process.env.DB_HOST);
console.log("Database user:", process.env.DB_USER);
console.log("Database name:", process.env.DB_NAME);
console.log("Database password:", process.env.DB_PASSWORD ? "Set" : "Not Set");

// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


// export pool instance for use in other files i.e server.js and plaid
module.exports = pool;