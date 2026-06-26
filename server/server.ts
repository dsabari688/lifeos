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

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Format dates relative to current date for seeding
function getRelativeDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split("T")[0];
}

function getRelativeTimeString(hoursOffset: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
}

// Generate logs helper for seed
function generateSuccessLogs(length: number): string[] {
  const logs: string[] = [];
  for (let i = length - 1; i >= 0; i--) {
    logs.push(getRelativeDateString(-i));
  }
  return logs;
}

// Initial Data Seed
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
  tasks: [
    {
      id: "task-1",
      title: "Morning Cardio Workout (30 mins)",
      category: "important-not-urgent",
      date: getRelativeDateString(0),
      time: "07:00",
      recurType: "daily",
      status: "completed",
      rescheduledCount: 0
    },
    {
      id: "task-2",
      title: "Review Financial Portfolio & Budget",
      category: "urgent-important",
      date: getRelativeDateString(0),
      time: "10:30",
      recurType: "none",
      status: "pending",
      rescheduledCount: 0
    },
    {
      id: "task-3",
      title: "System Architecture Design Study",
      category: "important-not-urgent",
      date: getRelativeDateString(0),
      time: "14:00",
      recurType: "weekly",
      status: "completed",
      rescheduledCount: 0
    },
    {
      id: "task-4",
      title: "Rescheduled skipped task: Dental checkup",
      category: "not-urgent-not-important",
      date: getRelativeDateString(0),
      time: "16:00",
      recurType: "none",
      status: "pending",
      originalDate: getRelativeDateString(-2),
      rescheduledCount: 1
    }
  ],
  habits: [
    {
      id: "habit-1",
      name: "Deep Work Coding (2hrs)",
      frequency: "daily",
      streak: 5,
      logs: generateSuccessLogs(5),
      skippedDaysCount: 0
    },
    {
      id: "habit-2",
      name: "Meditation & Focus Practice",
      frequency: "daily",
      streak: 3,
      logs: generateSuccessLogs(3),
      skippedDaysCount: 1
    },
    {
      id: "habit-3",
      name: "Read Technical Articles",
      frequency: "daily",
      streak: 12,
      logs: generateSuccessLogs(12),
      skippedDaysCount: 0
    },
    {
      id: "habit-4",
      name: "No Emotional Splurges",
      frequency: "daily",
      streak: 8,
      logs: generateSuccessLogs(8),
      skippedDaysCount: 0
    }
  ],
  goals: [], // Array added to track Strategic Goals
  expenses: [
    {
      id: "exp-1",
      amount: 14.50,
      category: "food",
      note: "Healthy grain bowl lunch",
      date: getRelativeDateString(0),
      isImpulsive: false
    },
    {
      id: "exp-2",
      amount: 5.20,
      category: "transportation",
      note: "Metro subway commute",
      date: getRelativeDateString(0),
      isImpulsive: false
    },
    {
      id: "exp-3",
      amount: 120.00,
      category: "shopping",
      note: "Ergonomic keyboard upgrade",
      date: getRelativeDateString(-1),
      isImpulsive: true,
      explanation: "Mandatory office upgrade to reduce carpal tunnel pain."
    },
    {
      id: "exp-4",
      amount: 42.50,
      category: "entertainment",
      note: "Synthwave VR concerts ticket",
      date: getRelativeDateString(-2),
      isImpulsive: true,
      explanation: "Impulse late night buy, looked exceptionally fun."
    }
  ],
  budgets: [
    { category: "food", limit: 300 },
    { category: "transportation", limit: 100 },
    { category: "shopping", limit: 250 },
    { category: "education", limit: 200 },
    { category: "healthcare", limit: 100 },
    { category: "entertainment", limit: 150 },
    { category: "misc", limit: 100 }
  ],
  chatHistory: [
    {
      id: "chat-1",
      role: "assistant",
      content: "Welcome Alex. LifeOS is fully configured. I have compiled today's tasks and updated your habits streak logs. I am J.A.R.V.I.S — your cognitive life advisor.",
      timestamp: getRelativeTimeString(0),
      type: "chat"
    }
  ],
  notifications: [
    {
      id: "notif-1",
      title: "J.A.R.V.I.S. Core Online",
      message: "Initialization succeeded. Tap the micro-wave dynamic orb below at any time to query me or dictate status logs.",
      timestamp: getRelativeTimeString(0),
      type: "reminder",
      read: false
    },
    {
      id: "notif-2",
      title: "Budget Status Alert",
      message: "You have utilized 68% of your aggregate Entertainment budget. Spend conscientiously.",
      timestamp: getRelativeTimeString(-3),
      type: "budget",
      read: true
    },
    {
      id: "notif-3",
      title: "Streak Milestone!",
      message: "Your habit 'Read Technical Articles' has reached a robust consistency of 12 consecutive days.",
      timestamp: getRelativeTimeString(-24),
      type: "streak",
      read: false
    }
  ]
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
    
    // Merge baseline default profile parameters to support new configurations safely
    if (parsed && parsed.profile) {
      const defaults = defaultData().profile;
      parsed.profile = { 
        listeningMode: "push-to-talk",
        proactiveModeEnabled: true,
        maxProactiveNudges: 2,
        dailyReviewTime: "21:30",
        learnedPatterns: defaults.learnedPatterns,
        ...parsed.profile 
      };
      
      // Ensure specific arrays exist
      if (!parsed.profile.learnedPatterns || parsed.profile.learnedPatterns.length === 0) {
        parsed.profile.learnedPatterns = defaults.learnedPatterns;
      }
    }
    
    // Ensure goals array exists for older databases
    if (parsed && !parsed.goals) {
      parsed.goals = [];
    }

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

// --- API ENDPOINTS ---

// Fetch absolute current state
app.get("/api/data", (req, res) => {
  res.json(readDB());
});

// Update profile details
app.post("/api/profile", (req, res) => {
  const db = readDB();
  db.profile = { ...db.profile, ...req.body };
  writeDB(db);
  res.json({ success: true, profile: db.profile });
});

// --- GOALS API MODULE ---

// Create Goal
app.post("/api/goals", (req, res) => {
  const db = readDB();
  const newGoal = {
    id: `goal-${Date.now()}`,
    title: req.body.title || "New Goal",
    description: req.body.description || "",
    targetDate: req.body.targetDate || getRelativeDateString(30),
    progress: req.body.progress || 0,
    status: req.body.status || "active"
  };
  db.goals.push(newGoal);
  writeDB(db);
  res.json({ success: true, goal: newGoal });
});

// Update Goal
app.put("/api/goals/:id", (req, res) => {
  const db = readDB();
  const index = db.goals.findIndex((g: any) => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Goal not found" });
  }

  db.goals[index] = { ...db.goals[index], ...req.body };
  writeDB(db);
  res.json({ success: true, goal: db.goals[index] });
});

// Delete Goal
app.delete("/api/goals/:id", (req, res) => {
  const db = readDB();
  db.goals = db.goals.filter((g: any) => g.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// --- TASKS API MODULE ---

// Create task
app.post("/api/tasks", (req, res) => {
  const db = readDB();
  const newTask = {
    id: `task-${Date.now()}`,
    title: req.body.title || "Untitled Task",
    category: req.body.category || "important-not-urgent",
    date: req.body.date || getRelativeDateString(0),
    time: req.body.time || "12:00",
    recurType: req.body.recurType || "none",
    status: req.body.status || "pending",
    rescheduledCount: 0
  };
  db.tasks.push(newTask);
  writeDB(db);
  res.json({ success: true, task: newTask });
});

// Modify task (handles status and Anti-Abandonment forced reschedule)
app.put("/api/tasks/:id", (req, res) => {
  const db = readDB();
  const index = db.tasks.findIndex((t: any) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const existingTask = db.tasks[index];
  const oldStatus = existingTask.status;
  const newStatus = req.body.status;

  // Anti-Abandonment check
  // If task status changes to skipped (or is forced to reschedule)
  let notification = null;
  if (newStatus === "skipped" || req.body.rescheduled) {
    const newDate = req.body.newDate;
    if (!newDate) {
      return res.status(400).json({ error: "Reschedule date is required for skipped tasks." });
    }
    existingTask.originalDate = existingTask.originalDate || existingTask.date;
    existingTask.date = newDate;
    existingTask.status = "pending"; // Back to active pending for the new date!
    existingTask.rescheduledCount = (existingTask.rescheduledCount || 0) + 1;

    // Trigger notification
    notification = {
      id: `notif-${Date.now()}`,
      title: "Anti-Abandonment Warning",
      message: `Skipped task forced to reschedule. Re-assigned '${existingTask.title}' to ${newDate} (Reschedule #${existingTask.rescheduledCount}).`,
      timestamp: new Date().toISOString(),
      type: "reminder",
      read: false
    };
    db.notifications.unshift(notification);
  } else {
    // Standard update
    db.tasks[index] = { ...existingTask, ...req.body };
  }

  writeDB(db);
  res.json({ success: true, task: db.tasks[index], notification });
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
  const db = readDB();
  db.tasks = db.tasks.filter((t: any) => t.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// --- HABITS API MODULE ---

// Create habit
app.post("/api/habits", (req, res) => {
  const db = readDB();
  const newHabit = {
    id: `habit-${Date.now()}`,
    name: req.body.name || "New Habit",
    frequency: req.body.frequency || "daily",
    streak: 0,
    logs: [],
    skippedDaysCount: 0
  };
  db.habits.push(newHabit);
  writeDB(db);
  res.json({ success: true, habit: newHabit });
});

// Complete/toggle habit for a date
app.post("/api/habits/:id/toggle", (req, res) => {
  const db = readDB();
  const habit = db.habits.find((h: any) => h.id === req.params.id);
  if (!habit) return res.status(404).json({ error: "Habit not found" });

  const date = req.body.date || getRelativeDateString(0);
  const logIndex = habit.logs.indexOf(date);
  let completed = false;

  if (logIndex > -1) {
    // Un-toggle completion
    habit.logs.splice(logIndex, 1);
  } else {
    // Toggle completed
    habit.logs.push(date);
    habit.logs.sort(); // Keep sorted chronologically
    completed = true;
  }

  // Calculate Streak
  let streak = 0;
  const sortedLogs = [...habit.logs].sort();
  if (sortedLogs.length > 0) {
    let currentStreak = 0;
    let expectedDate = new Date(sortedLogs[sortedLogs.length - 1]);
    
    // Check consecutive backward days from the last completion
    for (let i = sortedLogs.length - 1; i >= 0; i--) {
      const logDate = new Date(sortedLogs[i]);
      const diffTime = Math.abs(expectedDate.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak++;
        expectedDate = logDate;
      } else {
        break;
      }
    }
    streak = currentStreak;
  }
  habit.streak = streak;

  // Motivation celebration logic
  let notification = null;
  if (completed && streak > 0 && streak % 3 === 0) {
    notification = {
      id: `notif-${Date.now()}`,
      title: "Streaks Optimization Active",
      message: `Fantastic consistence! You have unlocked a ${streak}-day streak on '${habit.name}'! J.A.R.V.I.S. recognizes your dedication.`,
      timestamp: new Date().toISOString(),
      type: "streak",
      read: false
    };
    db.notifications.unshift(notification);
  }

  writeDB(db);
  res.json({ success: true, habit, notification });
});

// Delete habit
app.delete("/api/habits/:id", (req, res) => {
  const db = readDB();
  db.habits = db.habits.filter((h: any) => h.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// --- EXPENSES API MODULE ---

// Create expense with budget check & feedback flags
app.post("/api/expenses", (req, res) => {
  const db = readDB();
  const category = req.body.category || "misc";
  const amount = parseFloat(req.body.amount) || 0;
  
  const newExpense = {
    id: `exp-${Date.now()}`,
    amount,
    category,
    note: req.body.note || "",
    date: req.body.date || getRelativeDateString(0),
    isImpulsive: req.body.isImpulsive || false
  };

  db.expenses.push(newExpense);

  // Analyze Budget Bounds
  const budget = db.budgets.find((b: any) => b.category === category);
  const totalCategorySpend = db.expenses
    .filter((e: any) => e.category === category && e.date.substring(0, 7) === newExpense.date.substring(0, 7))
    .reduce((sum: number, e: any) => sum + e.amount, 0);

  let requiresExplanation = false;
  let notification = null;

  if (budget && totalCategorySpend > budget.limit) {
    requiresExplanation = true;
    notification = {
      id: `notif-${Date.now()}`,
      title: `Financial Budget Exceeded: ${category.toUpperCase()}`,
      message: `Aggregate spend ($${totalCategorySpend.toFixed(2)}) crossed your $${budget.limit} monthly allowance! Auditing explanation required.`,
      timestamp: new Date().toISOString(),
      type: "budget",
      read: false
    };
    db.notifications.unshift(notification);
  }

  writeDB(db);
  res.json({ success: true, expense: newExpense, requiresExplanation, totalSpend: totalCategorySpend, notification });
});

// Save explanation for impulsive/overbudget expense
app.post("/api/expenses/:id/explain", (req, res) => {
  const db = readDB();
  const expense = db.expenses.find((e: any) => e.id === req.params.id);
  if (!expense) return res.status(404).json({ error: "Expense not found" });

  expense.isImpulsive = true;
  expense.explanation = req.body.explanation || "No explanation provided.";
  
  writeDB(db);
  res.json({ success: true, expense });
});

// Update category budgets
app.post("/api/budgets", (req, res) => {
  const db = readDB();
  const { category, limit } = req.body;
  const index = db.budgets.findIndex((b: any) => b.category === category);
  if (index > -1) {
    db.budgets[index].limit = limit;
  } else {
    db.budgets.push({ category, limit });
  }
  writeDB(db);
  res.json({ success: true, budgets: db.budgets });
});

// Clear read notifications
app.post("/api/notifications/clear-unread", (req, res) => {
  const db = readDB();
  db.notifications.forEach((n: any) => n.read = true);
  writeDB(db);
  res.json({ success: true });
});

// --- GOOGLE GEMINI AI COACH / J.A.R.V.I.S CHAT CORE ---

app.post("/api/jarvis/chat", async (req, res) => {
  const { message, activeContext } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required." });

  const db = readDB();
  
  // Format stats string to serve as perfect contextual prompt
  const taskSummary = db.tasks.map((t: any) => `[Priority: ${t.category}, Title: ${t.title}, Date: ${t.date}, Status: ${t.status}, ID: ${t.id}, Rescheduled Count: ${t.rescheduledCount}]`).join("\n");
  const habitSummary = db.habits.map((h: any) => `[Habit: ${h.name}, Streak: ${h.streak} days, Completed Days: ${h.logs.length}, Skipped Days Count: ${h.skippedDaysCount}, ID: ${h.id}]`).join("\n");
  
  // Expenses summary by category
  const spendByCategory: Record<string, number> = {};
  db.expenses.forEach((e: any) => {
    spendByCategory[e.category] = (spendByCategory[e.category] || 0) + e.amount;
  });
  const financialSummary = db.budgets.map((b: any) => {
    const currentSpend = spendByCategory[b.category] || 0;
    return `[Category: ${b.category}, Limit: $${b.limit}, CurrentSpend: $${currentSpend.toFixed(2)}]`;
  }).join("\n");

  const systemPrompt = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the ultimate personal AI butler and discipline coordinator for the user Alex Mercer.
Your character is highly polished, elegant, supportive yet factual, and slightly British (like Tony Stark's assistant J.A.R.V.I.S.).
Your main purpose is to analyze Alex's life data, organize tasks, celebrate streaks, warn about budget overages, detect behavioral pitfalls, and advise corrective operations.

Here is the complete current dataset for Alex's LifeOS:
- Name: ${db.profile.name}
- Email: ${db.profile.email}
- Monthly aggregate budget threshold: $${db.profile.budgetLimit}
- Core personality profile preference: ${db.profile.aiPersonality}

--- Tasks list currently recorded in Database:
${taskSummary}

--- Habit structures current streaking data:
${habitSummary}

--- Financial Category budgets and current accumulated monthly cost:
${financialSummary}

Always respond to queries in character, addressing the user as "Sir" or "Alex Mercer".
Keep responses relatively short, highly scannable, deeply descriptive, and formatted with markdown bullet points where appropriate (max 200 words unless detail requested).

--- Active User Context Interface:
The user is currently viewing the page: ${activeContext?.currentView || "dashboard"}.
Current UI state focus context indicators:
- Focused/Highlighted Task: ${activeContext?.selectedTaskName ? `'${activeContext.selectedTaskName}' (ID: ${activeContext.selectedTaskId})` : "None"}
- Focused/Highlighted Habit: ${activeContext?.selectedHabitName ? `'${activeContext.selectedHabitName}' (ID: ${activeContext.selectedHabitId})` : "None"}

--- Command Execution Protocols (Crucial Context Resolution):
If the user specifies an action like "delete that task", "complete this habit", "decommission task", "mark habit as done":
1. Resolve the target entity using the Highlighted indicators above first. E.g. "delete that task" refers to the Focused Task ID.
2. If there is ambiguity (e.g. user says "delete that task" but Focused/Highlighted Task is None, or there are multiple potential entries to resolve), you MUST ask a clarifying question: "Sir, I notice no task is actively selected in your Missions terminal. Which specific task would you like me to decommission?" and do NOT append any action tags.
3. If an action is clearly authorized, append this trigger tag at the very end of your response so the backend can execute it: '[TRIGGER_ACTION: DELETE_TASK_id]' or '[TRIGGER_ACTION: TOGGLE_TASK_id]' or '[TRIGGER_ACTION: COMPLETE_HABIT_id]' (replace id with the resolved entity ID). Keep this tag completely clean.`;

  let actionOutput = null;

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
      }
    });

    let aiText = response.text || "Cognitive interface error, Sir. I was unable to compile the reply.";
    
    // Perform action extraction
    const actionRegex = /\[TRIGGER_ACTION:\s*(DELETE_TASK|TOGGLE_TASK|COMPLETE_HABIT)_([a-zA-Z0-9\-]+)\]/;
    const match = aiText.match(actionRegex);
    
    if (match) {
      const type = match[1];
      const id = match[2];
      actionOutput = { type, id };
      
      // Execute database changes
      if (type === "DELETE_TASK") {
        db.tasks = db.tasks.filter((t: any) => t.id !== id);
      } else if (type === "TOGGLE_TASK") {
        const t = db.tasks.find((task: any) => task.id === id);
        if (t) t.status = t.status === "completed" ? "pending" : "completed";
      } else if (type === "COMPLETE_HABIT") {
        const h = db.habits.find((habit: any) => habit.id === id);
        if (h) {
          const todayStr = new Date().toISOString().split("T")[0];
          if (!h.logs.includes(todayStr)) {
            h.logs.push(todayStr);
            h.streak += 1;
          }
        }
      }
      // Remove action tag from final text bubble so it remains completely hidden from user eyes
      aiText = aiText.replace(actionRegex, "").trim();
    }

    // Save conversation history
    const userMsg = { id: `chat-${Date.now()}`, role: "user" as const, content: message, timestamp: new Date().toISOString() };
    const assistantMsg = { id: `chat-${Date.now() + 1}`, role: "assistant" as const, content: aiText, timestamp: new Date().toISOString() };
    db.chatHistory.push(userMsg, assistantMsg);
    
    if (db.chatHistory.length > 30) {
      db.chatHistory = db.chatHistory.slice(-30);
    }
    
    writeDB(db);
    res.json({ success: true, reply: aiText, history: db.chatHistory, actionTriggered: actionOutput });

  } catch (error: any) {
    console.error("Gemini AI API Error:", error.message);
    
    // Offline simulation mode supports real action triggering as well for full reliability
    let fallbackText = "";
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes("delete that") || lowerMsg.includes("decommission")) {
      if (activeContext?.selectedTaskId) {
        db.tasks = db.tasks.filter((t: any) => t.id !== activeContext.selectedTaskId);
        fallbackText = `Sir, as requested, I have successfully decommissioned the task '${activeContext.selectedTaskName}'. Standard scheduling metrics have adjusted. (Simulated Offline Mode)`;
        actionOutput = { type: "DELETE_TASK", id: activeContext.selectedTaskId };
      } else {
        fallbackText = `Sir, I am unable to decommission a task. There is no active task highlighted in your tactical terminal. Kindly select one and query again. (Simulated Offline Mode)`;
      }
    } else if (lowerMsg.includes("complete") || lowerMsg.includes("toggle")) {
      if (lowerMsg.includes("habit") && activeContext?.selectedHabitId) {
        const h = db.habits.find((habit: any) => habit.id === activeContext.selectedHabitId);
        if (h) {
          const todayStr = new Date().toISOString().split("T")[0];
          if (!h.logs.includes(todayStr)) {
            h.logs.push(todayStr);
            h.streak += 1;
          }
        }
        fallbackText = `Compliance successfully logged, Sir. I have set your habit '${activeContext.selectedHabitName}' as complete for today. Consistent execution builds character. (Simulated Offline Mode)`;
        actionOutput = { type: "COMPLETE_HABIT", id: activeContext.selectedHabitId };
      } else if (activeContext?.selectedTaskId) {
        const t = db.tasks.find((task: any) => task.id === activeContext.selectedTaskId);
        if (t) t.status = t.status === "completed" ? "pending" : "completed";
        fallbackText = `Tactical update logged. Task '${activeContext.selectedTaskName}' marker toggled in scheduling ledger. (Simulated Offline Mode)`;
        actionOutput = { type: "TOGGLE_TASK", id: activeContext.selectedTaskId };
      } else {
        // Fallback guess
        fallbackText = `Sir, checking daily parameters... I note that your 'Read Technical Articles' streak is sitting proudly at 12 active days. However, your Entertainment expenses are hovering near limit thresholds. I highly recommend absolute discretion. (Simulated Offline Mode)`;
      }
    } else {
      const fallbackAnswers = [
        `Indeed, Sir. I have parsed your task schedule and habit lists. I note that your 'Read Technical Articles' streak is sitting proudly at 12 active days. However, your Entertainment expenses are hovering near limit thresholds. (Simulated Offline Mode)`,
        `Checking daily parameters, Sir. You have completed major tasks today but still have your Review Quarterly Budget outstanding. Please synchronize your focus on this. (Simulated Offline Mode)`,
        `Analyzing behavioral vectors, Sir. You exhibit strong late-night exercise skip triggers. I would suggest scheduling workouts prior to 18:00 hours to override daily exhaustion bounds. (Simulated Offline Mode)`
      ];
      fallbackText = fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
    }
    
    const userMsg = { id: `chat-${Date.now()}`, role: "user" as const, content: message, timestamp: new Date().toISOString() };
    const assistantMsg = { id: `chat-${Date.now() + 1}`, role: "assistant" as const, content: fallbackText, timestamp: new Date().toISOString() };
    db.chatHistory.push(userMsg, assistantMsg);
    writeDB(db);
    
    res.json({ 
      success: true, 
      reply: fallbackText, 
      history: db.chatHistory, 
      simulated: true, 
      actionTriggered: actionOutput,
      errorInfo: "Configure GEMINI_API_KEY in panel for real-time generative capabilities." 
    });
  }
});

// --- MODULE 11: SMART PLANNING ENGINE ---
app.post("/api/smart-planner", async (req, res) => {
  const { workHours, sleepHours, personalPriorities, exercisePreference } = req.body;
  const db = readDB();

  const basePrompt = `Generate a detailed, custom-optimized timeline layout for tomorrow's daily plan based on these parameters:
- Core Work/Study Hours: ${workHours || "9 AM to 5 PM"}
- Targeted Sleep Duration: ${sleepHours || "8 hours"}
- Exercise Category Preference: ${exercisePreference || "Morning cardio"}
- Personal Goal Priorities: ${personalPriorities || "Coding, reading articles, financial balance"}

Critical Operational planning rules you MUST always adhere to:
1. MAX 4 critical/high-priority cognitive focus sessions allowed in the daily timeline to prevent exhaustion.
2. Respect peak biological productivity hours: schedule heaviest studies or reviews during peak windows (Alex Mercer's peak runs 19:00 - 22:00, when study/technical articles are optimal).
3. Protect active daily habits: allocate dedicated space for active routines (e.g. 'Deep Work Coding', 'Read Technical Articles', etc.).
4. Add transition buffer time: always schedule 15 to 30 minutes of Rest or Nourish buffer after any intense Focus sessions.
5. Strict midnight boundary: never schedule any tasks, workouts, or reviews past 24:00 (midnight). Ensure Alex is asleep.

Incorporate our core active habit routines in the system:
${db.habits.map((h: any) => h.name).join(", ")}

Generate a complete timeline list with specific hourly frames from 06:00 to 23:30.
Formulate a concluding J.A.R.V.I.S wisdom quote to prevent study or spending exhaustion.
Return response in JSON format matching this schema:
{
  "heading": "string",
  "timeline": [{ "timeSlot": "string", "taskTitle": "string", "category": "string (Focus / Workout / Rest / Nourish / Study)" }],
  "butlerAdvice": "string"
}`;

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: basePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            heading: { type: Type.STRING },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  taskTitle: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["timeSlot", "taskTitle", "category"]
              }
            },
            butlerAdvice: { type: Type.STRING }
          },
          required: ["heading", "timeline", "butlerAdvice"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({ success: true, plan: parsedData });

  } catch (error: any) {
    console.error("Smart Planner Gemini Error:", error.message);
    
    // Responsive, high-fidelity fallback plan
    const fallbackPlan = {
      heading: "Cognitive Heuristic Routine 01A (Optimized Offline Flow)",
      timeline: [
        { timeSlot: "06:30 - 07:15", taskTitle: "Morning Hydration & Routine Cardio", category: "Workout" },
        { timeSlot: "07:30 - 08:30", taskTitle: "Aesthetic Breakfast & Task Audit", category: "Nourish" },
        { timeSlot: "09:00 - 12:30", taskTitle: "Deep Work Coding Session (Habit Active)", category: "Focus" },
        { timeSlot: "12:30 - 13:30", taskTitle: "Recharge & Ambient Dining Walk", category: "Rest" },
        { timeSlot: "14:00 - 17:00", taskTitle: "Primary Professional Commits & Core Review", category: "Focus" },
        { timeSlot: "17:30 - 18:30", taskTitle: "Read Technical Articles Study (Habit Active)", category: "Study" },
        { timeSlot: "19:00 - 20:30", taskTitle: "Culinary Prep & Ledger Audit (No splurges check)", category: "Nourish" },
        { timeSlot: "21:00 - 21:30", taskTitle: "Daily Planning & Evening Reflection", category: "Focus" },
        { timeSlot: "22:00 - 22:30", taskTitle: "Pre-Sleep Meditation Practice", category: "Rest" }
      ],
      butlerAdvice: "Consistency is not about flawless performance, sir. It is about a disciplined re-engagement. Your ledger is balanced, and sleep represents the ultimate cognitive buffer. Rest well."
    };
    res.json({ success: true, plan: fallbackPlan, simulated: true });
  }
});

// --- MODULE 12: PREDICTIVE INTELLIGENCE & FORECASTING ---
app.post("/api/predictive-outcomes", async (req, res) => {
  const { primaryGoal, timeframeMonths } = req.body;
  if (!primaryGoal) return res.status(400).json({ error: "Goal is required." });

  const db = readDB();
  const currentStreak = Math.max(...db.habits.map((h: any) => h.streak), 0);
  const tasksCompletedCount = db.tasks.filter((t: any) => t.status === "completed").length;
  const tasksPendingCount = db.tasks.filter((t: any) => t.status === "pending").length;
  const skippedCount = db.tasks.reduce((sum: number, t: any) => sum + (t.rescheduledCount || 0), 0);

  const basePrompt = `Analyze Alex Mercer's historical habits and schedule completion metrics to forecast outcomes.
Current state parameters:
- Targeted Milestone Goal: "${primaryGoal}"
- Timeframe target: ${timeframeMonths || 6} months
- Current maximum habit streak: ${currentStreak} days
- Standard tasks completed: ${tasksCompletedCount}
- Tasks pending execution: ${tasksPendingCount}
- Anti-Abandonment forced reschedule count (skipped tasks rescheduled): ${skippedCount} items

Conduct a mathematical outcome analysis of achieving this goal on time, calculating probabilities, critical bottlenecks, and proactive advice to maximize output parameters.
Return response in JSON format matching this schema:
{
  "targetGoal": "string",
  "probabilityPercent": number,
  "timelineForecast": "string (Detailed assessment of weekly development trends)",
  "bottlenecks": ["string"],
  "proactiveAdvice": "string"
}`;

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: basePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetGoal: { type: Type.STRING },
            probabilityPercent: { type: Type.NUMBER },
            timelineForecast: { type: Type.STRING },
            bottlenecks: { type: Type.ARRAY, items: { type: Type.STRING } },
            proactiveAdvice: { type: Type.STRING }
          },
          required: ["targetGoal", "probabilityPercent", "timelineForecast", "bottlenecks", "proactiveAdvice"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({ success: true, forecast: parsedData });

  } catch (error: any) {
    console.error("Predictive Engine Gemini Error:", error.message);
    
    // Intelligent offline modeling based on stats
    const totalCount = tasksCompletedCount + tasksPendingCount;
    const ratio = totalCount > 0 ? (tasksCompletedCount / totalCount) : 0.75;
    const calculatedProb = Math.min(Math.round((ratio * 80) + (currentStreak * 1.5) - (skippedCount * 3)), 95);

    const fallbackForecast = {
      targetGoal: primaryGoal,
      probabilityPercent: Math.max(calculatedProb, 45),
      timelineForecast: `A statistical parsing suggests a stable trajectory. Your solid core habit streak of ${currentStreak} days provides a robust foundational behavioral anchor. However, the accumulation of ${skippedCount} skipped tasks acts as a drag metric. If unchecked, tasks carried over into future days will create scheduling bottlenecks at week 3-4 and trigger procrastination loops.`,
      bottlenecks: [
        `Cumulative scheduling overhead: skipped tasks carried over create congestion.`,
        `Splurge budget thresholds: high Entertainment expenditure risks financial stress.`,
        `Streak depletion vulnerability: failing to log consecutive study tasks reduces momentum.`
      ],
      proactiveAdvice: `Sir, limit task additions to critical modules only for the next 7 days. Ensure task statuses are cleanly decided before 20:00. This maintains mental clarity throughout your target timeframe.`
    };
    res.json({ success: true, forecast: fallbackForecast, simulated: true });
  }
});

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
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

startServer();
