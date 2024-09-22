import express from "express";
import session from "express-session";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import http from "http";
import { WebSocketServer } from "ws";
import { initDb } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

// Initialize Database
initDb()
  .then(() => {
    console.log("Database initialized");
  })
  .catch((err) => {
    console.error("Error initializing database:", err);
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

export { wss };

wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  ws.on("message", (message) => {
    console.log("Received message from client:", message);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Middleware setup
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
const SECRET_KEY = process.env.SECRET_KEY;
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

// Route handlers
app.use("/auth", authRoutes); // Authentication routes
app.use("/files", fileRoutes); // File handling routes
app.use("/videos", videoRoutes); // Video handling routes

// Serve signup page (if necessary)
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Serve index.html for other routes
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
    res.redirect("/");
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
