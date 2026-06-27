import express from "express";
import path from "path";
import fs from "fs";
import * as vite from "vite";
const createViteServer = vite.createServer;
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5001;
const DB_FILE = path.join(process.cwd(), "lifeos_db.json");

app.use(express.json());

// User Model
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  createdAt: string;
}

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is required");
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return aiInstance;
}

// Updated defaultData with users array
const defaultData = () => ({
  profile: {
    name: "Alex Mercer",
    email: "alex.mercer@stark.corp",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
    budgetLimit: 1200,
    aiPersonality: "Logical",
    dailyPlanningReminderTime: "21:00",
    hasPlannedTomorrow: false,
    listeningMode: "push-to-talk",
    proactiveModeEnabled: true,
    maxProactiveNudges: 2,
    dailyReviewTime: "21:30",
    learnedPatterns: [
      "Peak cognitive focus observed between 19:00 - 22:00 hours for coding studies.",
      "Skipping morning cardio blocks exhibits an 18% average reduction in task consistency index.",
      "Late-night eating category shows high susceptibility to emotional impulse buys (average $38/spend).",
      "Goal streak consistency rises by 42% when tasks are completed prior to 20:00 hours."
    ]
  },
  users: [] as User[],
  tasks: [],
  habits: [],
  goals: [],
  expenses: [],
  budgets: [],
  chatHistory: [],
  notifications: []
});

// Database utilities
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const data = defaultData();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      return data;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);

    if (!parsed.users) parsed.users = [];
    if (!parsed.goals) parsed.goals = [];
    if (!parsed.profile) parsed.profile = defaultData().profile;

    return parsed;
  } catch (err) {
    console.error("Error reading database file", err);
    return defaultData();
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// ====================== AUTH ROUTES ======================

// Register User
app.post("/api/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  const db = readDB();

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const existing = db.users.find((u: any) => 
    u.email === email || u.username === username
  );

  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    email,
    password,
    verified: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({
    success: true,
    message: "Account created successfully! Please verify your email.",
    user: { id: newUser.id, username, email, verified: false }
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const db = readDB();

  const user = db.users.find((u: any) => 
    u.email === usernameOrEmail || u.username === usernameOrEmail
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username or email" });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  if (!user.verified) {
    return res.status(403).json({ error: "Please verify your email first" });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// Verify Email (Simulation)
app.post("/api/auth/verify-email", (req, res) => {
  const { email } = req.body;
  const db = readDB();
  
  const user = db.users.find((u: any) => u.email === email);
  if (user) {
    user.verified = true;
    writeDB(db);
    res.json({ success: true, message: "Email verified successfully!" });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// ====================== EXISTING ROUTES ======================
// (Keep all your existing routes: /api/data, /api/tasks, /api/habits, etc.)

// ... Paste all your existing API routes here (tasks, habits, goals, chat, etc.) ...

// Setup Vite & static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
  });
  // OTP Store (Temporary in-memory)
const otpStore = new Map();

// Send OTP
app.post("/api/auth/send-otp", (req, res) => {
  const { email } = req.body;
  const db = readDB();

  const user = db.users.find((u: any) => u.email === email);
  if (!user) return res.status(404).json({ error: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 120000; // 2 minutes

  otpStore.set(email, { otp, expiresAt });

  console.log(`🔐 OTP for ${email} → ${otp}`); // You will see this in terminal

  res.json({ success: true, message: "OTP sent to your email!" });
});

// Verify OTP
app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const stored = otpStore.get(email);

  if (!stored) return res.status(400).json({ error: "No OTP request found" });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired. Request new one." });
  }
  if (stored.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  // Mark as verified
  const db = readDB();
  const user = db.users.find((u: any) => u.email === email);
  if (user) {
    user.verified = true;
    writeDB(db);
  }

  otpStore.delete(email);
  res.json({ success: true, message: "Email verified successfully!" });
});
}

startServer();