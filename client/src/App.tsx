import React, { useState, useEffect } from "react";
import { 
  Menu, X, Bell, LayoutDashboard, Calendar, RefreshCw, Target, 
  LineChart, Cpu, Clock, Settings, LogOut, Terminal, ChevronRight, Zap, Info
} from "lucide-react";

// Page Components
import { DashboardView } from "./components/DashboardView";
import { MissionsView } from "./components/MissionsView";
import { HabitsView } from "./components/HabitsView";
import { GoalsView } from "./components/GoalsView";
import { AnalyticsView } from "./components/AnalyticsView";
import { PiggyChatView } from "./components/PiggyChatView";
import { FocusModeView } from "./components/FocusModeView";
import { SettingsView } from "./components/SettingsView";

// Modals
import { TaskModal } from "./components/TaskModal";
import { NotificationDrawer } from "./components/NotificationDrawer";
import { DailyReviewModal } from "./components/DailyReviewModal";

import { FullOSData, Task, TaskPriority } from "./types";

type ViewState = "dashboard" | "missions" | "habits" | "goals" | "analytics" | "ai-core" | "focus-timer" | "settings";

export default function App() {
  // Navigation
  const [activeView, setActiveView] = useState<ViewState>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Splash & Auth States
  const [splashStep, setSplashStep] = useState(0);
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

  // Sign Up Modal
  const [showSignUp, setShowSignUp] = useState(false);
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // App Data
  const [osData, setOsData] = useState<FullOSData | null>(null);
  const [isUpdatingDb, setIsUpdatingDb] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedHabitName, setSelectedHabitName] = useState<string | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDailyReviewOpen, setIsDailyReviewOpen] = useState(false);

  // Splash Messages
  const splashMessages = [
    "Calibrating system parameters...",
    "Synchronizing diagnostic telemetry logs...",
    "Hydrating local command matrices...",
    "Rebalancing financial allocations threshold...",
    "Piggy online. Uplink success, Sir."
  ];

  // Splash Effect
  useEffect(() => {
    if (!isSplashDone) {
      const interval = setInterval(() => {
        setSplashStep((prev) => {
          if (prev >= splashMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => setIsSplashDone(true), 600);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isSplashDone]);

  // Hydrate Data
  const hydrateSystemData = async () => {
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const payload: FullOSData = await res.json();
        setOsData(payload);
      }
    } catch (err) {
      console.error("Failure hydrating LifeOS state:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) hydrateSystemData();
  }, [isLoggedIn]);

  // Auth Handlers
  const handleRegister = async () => {
    if (!signupUsername || !signupEmail || !signupPassword) {
      alert("All fields are required!");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Account created successfully!\nPlease verify your email.");
        setShowSignUp(false);
        setSignupUsername(""); setSignupEmail(""); setSignupPassword("");
      } else {
        alert("❌ " + (data.error || "Registration failed"));
      }
    } catch (err) {
      alert("Registration failed. Server may not be running.");
    }
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert("Email and Password are required!");
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
        alert(`✅ Welcome back, ${data.user.username}!`);
      } else {
        alert("❌ " + (data.error || "Invalid credentials"));
      }
    } catch (err) {
      alert("Login failed. Make sure backend server is running.");
    }
  };

  // ==================== MAIN APP UI ====================
  if (!isSplashDone) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full space-y-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-500/[0.02] border border-amber-500/[0.04] animate-ping duration-3000 pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 animate-jarvis-breath mx-auto flex items-center justify-center">
            <Cpu className="w-10 h-10 text-slate-900" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-3xl tracking-widest text-amber-500 uppercase glow-text-amber">LIFE OS</h1>
            <p className="text-slate-500 font-mono text-[10px] tracking-widest">PERSONAL COMMAND COCKPIT</p>
          </div>
          <div className="pt-6 font-mono text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>{splashMessages[splashStep]}</span>
            </div>
            <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-amber-500 transition-all duration-300 rounded-full" style={{ width: `${((splashStep + 1) / splashMessages.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
    // ==================== LOGIN SCREEN ====================
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-amber-500">
              <Terminal className="w-7 h-7" />
            </div>
            <h2 className="font-display font-black text-2xl text-slate-800">Secure Terminal Port</h2>
            <p className="text-xs text-slate-500">Sabarinathan, unlock your daily LifeOS parameters interface.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email or Username</label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                placeholder="dsabari688@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Login to LifeOS
            </button>

            <div className="flex justify-between text-sm text-slate-500 pt-2">
              <button onClick={() => setShowSignUp(true)} className="hover:text-amber-600">Create new account</button>
              <button className="hover:text-amber-600">Forgot Password?</button>
            </div>
          </div>
        </div>

        {/* Sign Up Modal */}
        {showSignUp && (
          <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h3 className="font-bold text-xl mb-6">Create New Account</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Username" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} className="w-full px-4 py-3 border rounded-xl" />
                <input type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl" />
                <input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl" />
                <button onClick={handleRegister} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">Create Account</button>
                <button onClick={() => setShowSignUp(false)} className="w-full py-3 border border-slate-300 rounded-xl">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Application
  if (!osData) {
    return <div className="fixed inset-0 bg-white flex items-center justify-center text-slate-400">Synchronizing databases...</div>;
  }

  const unreadCount = osData.notifications.filter(n => !n.read).length;
  const todayStrForScore = new Date().toISOString().split("T")[0];
  const taskScore = osData.tasks.length ? (osData.tasks.filter(t => t.status === "completed").length / osData.tasks.length) * 60 : 0;
  const habitScore = osData.habits.length ? (osData.habits.filter(h => h.logs.includes(todayStrForScore)).length / osData.habits.length) * 40 : 0;
  const realProductivityScore = Math.round(taskScore + habitScore);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-650 flex font-sans">
      {/* Sidebar, Header, Main Content, Modals, Floating Orb - Paste your original code here if needed */}
      {/* For now, this is the skeleton. You can expand it later. */}
      <div>LifeOS Main UI Loaded Successfully</div>
    </div>
  );
} 