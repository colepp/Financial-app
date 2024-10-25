
// postgresql reqs
const {Pool} = require('pg');


// Load .env file varieables into proess
require('dotenv').config();

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