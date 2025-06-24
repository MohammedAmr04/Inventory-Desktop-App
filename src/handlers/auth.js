import db from "../db/db";

// Login user from database
export function loginUser({ username, password }) {
  const user = db
    .prepare("SELECT * FROM users WHERE username = ? AND password = ?")
    .get(username, password);

  if (user) {
    console.log(user);
    return { success: true, user };
  } else {
    console.log(`user is notlogin`);

    return { success: false, message: "Invalid username or password." };
  }
}

// Register new user in database
export function registerUser({ username, password }) {
  // Check if user already exists
  const existing = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (existing) {
    return { success: false, message: "Username already exists." };
  }
  // Insert new user
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
    username,
    password
  );
  console.log(`user is register`);

  return { success: true, message: "Registration successful." };
}
