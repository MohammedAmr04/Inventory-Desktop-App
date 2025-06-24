import db from "../db/db.js";

// Fetch products with pagination and category join
function getProducts(page = 1, pageSize = 15, filters = {}) {
  const offset = (page - 1) * pageSize;
  let where = [];
  let params = [];
  if (filters.search) {
    where.push("p.name LIKE ?");
    params.push(`%${filters.search}%`);
  }
  if (filters.category) {
    where.push("p.category_id = ?");
    params.push(filters.category);
  }
  if (filters.minPrice) {
    where.push("p.retail_price >= ?");
    params.push(filters.minPrice);
  }
  if (filters.maxPrice) {
    where.push("p.retail_price <= ?");
    params.push(filters.maxPrice);
  }
  if (filters.minQty) {
    where.push("p.quantity >= ?");
    params.push(filters.minQty);
  }
  if (filters.maxQty) {
    where.push("p.quantity <= ?");
    params.push(filters.maxQty);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const products = db
    .prepare(
      `
    SELECT p.id, p.name, c.name as category, p.quantity, p.cost_price, p.wholesale_price, p.retail_price
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `
    )
    .all(...params, pageSize, offset);
  const total = db
    .prepare(
      `
    SELECT COUNT(*) as count FROM products p
    ${whereClause}
  `
    )
    .get(...params).count;
  return { products, total };
}

// Fetch all categories
function getCategories() {
  return db.prepare("SELECT id, name FROM categories ORDER BY name").all();
}

// Add a new product
function addProduct(product) {
  const stmt = db.prepare(`
    INSERT INTO products (name, category_id, quantity, cost_price, wholesale_price, retail_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    product.name,
    product.category_id,
    product.quantity,
    product.cost_price,
    product.wholesale_price,
    product.retail_price
  );
  return info.lastInsertRowid;
}

// Edit a product
function editProduct(product) {
  const stmt = db.prepare(`
    UPDATE products SET name=?, category_id=?, quantity=?, cost_price=?, wholesale_price=?, retail_price=? WHERE id=?
  `);
  stmt.run(
    product.name,
    product.category_id,
    product.quantity,
    product.cost_price,
    product.wholesale_price,
    product.retail_price,
    product.id
  );
}

// Delete a product
function deleteProduct(id) {
  db.prepare("DELETE FROM products WHERE id=?").run(id);
}

// Fetch a single product by id (for edit)
function getProductById(id) {
  return db
    .prepare(
      `
    SELECT p.id, p.name, p.category_id, c.name as category, p.quantity, p.cost_price, p.wholesale_price, p.retail_price
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `
    )
    .get(id);
}

// Add a new category
function addCategory(name) {
  const stmt = db.prepare(`INSERT INTO categories (name) VALUES (?)`);
  const info = stmt.run(name.trim());
  return info.lastInsertRowid;
}

// Fetch all products (id, name, quantity, retail_price)
function getAllProducts() {
  return db
    .prepare(
      "SELECT id, name, quantity, retail_price FROM products ORDER BY name"
    )
    .all();
}

// Save a transaction and its items
function saveTransaction({ customer_name, items, user_id = 1 }) {
  if (!customer_name || !items || !items.length)
    throw new Error("Invalid transaction data");
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const tx = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO transactions (customer_name, total, user_id) VALUES (?, ?, ?)`
      )
      .run(customer_name, total, user_id);
    const transaction_id = info.lastInsertRowid;
    const stmt = db.prepare(
      `INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`
    );
    for (const item of items) {
      stmt.run(transaction_id, item.productId, item.quantity, item.price);
      // Decrement product stock
      db.prepare(
        `UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?`
      ).run(item.quantity, item.productId, item.quantity);
    }
    return transaction_id;
  });
  tx();
}

export {
  getProducts,
  getCategories,
  addProduct,
  editProduct,
  deleteProduct,
  getProductById,
  addCategory,
  getAllProducts,
  saveTransaction,
};

export default {
  getProducts,
  getCategories,
  addProduct,
  editProduct,
  deleteProduct,
  getProductById,
  addCategory,
  getAllProducts,
  saveTransaction,
};
