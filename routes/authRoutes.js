import express from "express";
import jwt from "jsonwebtoken";
import { validateUser, saveUser } from "../utils/auth.js";

const router = express.Router();

// Login Route (Already existing)
router.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;
  if (validateUser(username, password)) {
    const token = jwt.sign({ username }, process.env.SECRET_KEY);
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// New Signup Route
router.post("/signup", express.json(), (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (validateUser(username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  saveUser({ username, email, password });

  const token = jwt.sign({ username }, process.env.SECRET_KEY);
  res.json({ token });
});

export default router;
