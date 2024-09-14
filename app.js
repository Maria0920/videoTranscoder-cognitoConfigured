import express from "express";
import session from "express-session";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import http from "http"; // Import HTTP module
import { WebSocketServer } from "ws";
import { initDb } from "./utils/db.js";

initDb()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((err) => {
    console.error("Error initializing database:", err);
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const port = 3000;

const server = http.createServer(app); // Create an HTTP server with Express

// Create a WebSocket server on top of the HTTP server
const wss = new WebSocketServer({ server });

export { wss };

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  ws.on("send", (message) => {
    console.log("Received message from client:", message);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Import routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

// Setup session
const SECRET_KEY = process.env.SECRET_KEY;
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public"))); // Ensure static files are served

// Use routes
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/videos", videoRoutes);

// Serve signup.html separately if needed
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Serve index.html for all other routes (SPA catch-all)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/"); // Redirect to login page
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
