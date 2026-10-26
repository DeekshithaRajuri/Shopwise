require('dotenv').config();
const { Pool } = require('pg');

// one shared connection pool for the whole app
module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
