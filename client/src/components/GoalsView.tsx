import React, { useState } from "react";
import { Target, Calendar, Plus, Trophy, Hourglass, ShieldCheck, Flame, Trash2 } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  progressPercent: number;
  targetDate: string;
  tasksCount: number;
  streak: number;
  status: "on-track" | "behind" | "at-risk";
}

interface GoalsViewProps {
  // Simple internal state is appropriate here for robust client-side control
}

export const GoalsView: React.FC<GoalsViewProps> = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "goal-1",
      title: "Synthesize Core Cognitive AI Subsystem (J.A.R.V.I.S Codebase)",
      progressPercent: 82,
      targetDate: "2026-08-15",
      tasksCount: 14,
      streak: 9,
      status: "on-track"
    },
    {
      id: "goal-2",
      title: "Optimize Financial Portfolio Spent Buffers limit",
      progressPercent: 60,
      targetDate: "2026-07-30",
      tasksCount: 6,
      streak: 15,
      status: "on-track"
    },
    {
      id: "goal-3",
      title: "Consolidated Physical Resistance Benchmarks (1000lbs Club)",
      progressPercent: 45,
      targetDate: "2026-12-25",
      tasksCount: 22,
      streak: 3,
      status: "behind"
    },
    {
      id: "goal-4",
      title: "Audit Systems Security protocols for cloud VPS platforms",
      progressPercent: 12,
      targetDate: "2026-06-30",
      tasksCount: 4,
      streak: 0,
      status: "at-risk"
    }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("2026-09-30");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newG: Goal = {
      id: `goal-${Date.now()}`,
      title: newTitle,
      progressPercent: 0,
      targetDate: newDate,
      tasksCount: 0,
      streak: 0,
      status: "on-track"
    };
    setGoals([newG, ...goals]);
    setNewTitle("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">Strategic Goal Vault</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Track multi-week macro directives and milestones.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-900 stroke-3" />
          Institute Goal
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-4 items-end animate-in slide-in-from-top-4 duration-200">
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Strategic Milestone Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Accomplish Advanced Algorithms Certification"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="w-full md:w-48 space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Target Date Limit</label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto font-display">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="w-full md:w-20 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full md:px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all"
            >
              Lock In
            </button>
          </div>
        </form>
      )}

      {/* Goal Cards Stack */}
      <div className="space-y-5">
        {goals.map((g) => {
          let statusLabel = "On Track";
          let statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-150";

          if (g.status === "behind") {
            statusLabel = "Behind Schedule";
            statusBadgeClass = "bg-amber-50 text-amber-700 border-amber-150";
          } else if (g.status === "at-risk") {
            statusLabel = "At Critical Risk";
            statusBadgeClass = "bg-rose-50 text-rose-700 border-rose-150";
          }

          return (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs hover:shadow-md transition-all duration-200 hover:border-amber-500/20 group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-500 shrink-0" />
                    <h4 className="font-display font-black text-slate-800 text-sm md:text-base leading-snug group-hover:text-amber-900 transition-colors">
                      {g.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 pl-7">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target Date threshold: <span className="text-slate-600 font-medium">{g.targetDate}</span></span>
                  </div>
                </div>

                <div className="text-right pl-7 md:pl-0 shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-0">
                  <span className="font-display font-black text-2xl text-amber-500">
                    {g.progressPercent}%
                  </span>
                  <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Complete</p>
                </div>
              </div>

              {/* Progress bar with smooth ambient background aspect */}
              <div className="mt-4 pb-4">
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                  <div 
                    className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
                    style={{ width: `${g.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Tag metadata row */}
              <div className="flex flex-wrap items-center justify-between border-t border-slate-50 pt-4 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider font-mono ${statusBadgeClass}`}>
                    {statusLabel}
                  </span>

                  <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 text-slate-500 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {g.tasksCount} integrated modules
                  </span>

                  {g.streak > 0 && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      Streak {g.streak} days
                    </span>
                  )}
                </div>

                {/* Trash Decommission button showing on hover */}
                <button
                  onClick={() => handleDelete(g.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer flex items-center justify-center"
                  title="Decommission goal directive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
