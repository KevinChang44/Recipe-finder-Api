require("dotenv").config();

const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: 3306,
};

const pool = mysql.createPool(dbConfig);

async function initializeDatabase() {
  try {
    console.log("📡 Connecting to MySQL database...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Users table ready");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        meal_id VARCHAR(255) NOT NULL,
        meal_name TEXT NOT NULL,
        meal_thumb TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, meal_id)
      )
    `);
    console.log("✅ Favorites table ready");
  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    await pool.end();
    process.exit(1);
  }
}

initializeDatabase();

module.exports = pool;
