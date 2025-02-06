require('dotenv').config();
const { Client } = require('pg');


const pgClient = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});
pgClient
    .connect()
    .then(() => console.log("Connected to PostgreSQL successfully"))
    .catch((err) => console.error("Connection error:", err.stack));

module.exports = pgClient;
