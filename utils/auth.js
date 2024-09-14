import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersPath = path.join(__dirname, "../users.json");

// Load users from the JSON file
const loadUsers = () => {
  const usersData = fs.readFileSync(usersPath);
  return JSON.parse(usersData);
};

// Save a new user
export const saveUser = (newUser) => {
  const users = loadUsers();
  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
};

// Function to validate user
export const validateUser = (username, password = null) => {
  const users = loadUsers();

  // If password is provided, validate both username and password
  if (password) {
    return users.some(
      (user) => user.username === username && user.password === password
    );
  }

  // If no password, just check if username exists
  return users.some((user) => user.username === username);
};

// Middleware to authenticate users
export const authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send("Forbidden");
    req.user = user;
    next();
  });
};
