// db.js

const Database = require("better-sqlite3");

// Open or create the database
const db = new Database("inventory.db");

// ====== Users Table ======
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`
).run();
// Used for user registration and login

// ====== Categories Table ======
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )
`
).run();
// Stores product categories (e.g., electronics, clothing)

// ====== Products Table ======
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    quantity INTEGER DEFAULT 0,
    cost_price REAL,
    wholesale_price REAL,
    retail_price REAL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )
`
).run();
// Stores product details, quantity, and multiple prices

// ====== Transactions Table ======
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    total REAL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`
).run();
// Represents each sale transaction with customer and user info

// ====== Transaction Items Table ======
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    is_wholesale INTEGER DEFAULT 0,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`
).run();
// Stores the items inside each transaction and their sale price

// ====== Logs Table ======
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`
).run();
// Logs any important actions (login, product changes, sales, etc.)

export default db;
