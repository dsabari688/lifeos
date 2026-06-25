import React, { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Clock, Activity, Sparkles, Brain } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsViewProps {
  // Let's hook up client data or map beautiful mock parameters
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = () => {
  const [currentMonth, setCurrentMonth] = useState("June 2026");

  // Recharts payload for weekly completion rates
  const barChartData = [
    { day: "MON", completion: 60 },
    { day: "TUE", completion: 85 },
    { day: "WED", completion: 70 },
    { day: "THU", completion: 90 },
    { day: "FRI", completion: 40 },
    { day: "SAT", completion: 95 },
    { day: "SUN", completion: 84 } // Highlighted: Today (Sunday)
  ];

  const metrics = [
    { value: "84%", label: "Completion Rate", trend: "↑ +6% vs last week", isPositive: true },
    { value: "2", label: "Missed Tasks", trend: "↓ -4% vs last week", isPositive: true },
    { value: "42.5h", label: "Interactive Coding Time", trend: "↑ +12% vs last week", isPositive: true },
    { value: "18", label: "Focus Blocks", trend: "↑ 2 periods increase", isPositive: true }
  ];

  const piggyInsights = [
    {
      subject: "Cognitive Chronostasis",
      observation: " Alex, neural data reveals an 18% spike in your focus completion rates when coding runs between 09:00 and 11:30 block. Prioritize these quadrants."
    },
    {
      subject: "Financial Exposure Warning",
      observation: " Impulsive ledger expenditures (including Ergonomic keyboard buy) reached $162.50 this cycle. Stay aligned with Whole Foods budget limit, Sir."
    },
    {
      subject: "Sleep Buffer Maintenance",
      observation: " Daily Planning triggers past 22:30 show correlations with a 7% decline in cardio focus velocity the following morning. Discipline sleep thresholds."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upper Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">Analytical Metrics</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Statistical outputs derived from LifeOS modules.</p>
        </div>
        
        {/* Month Scroll */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-xl p-1 shadow-xs">
          <button 
            className="p-1 px-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg font-bold"
            onClick={() => setCurrentMonth("May 2026")}
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <span className="font-mono text-xs font-bold text-slate-700 px-3 tracking-wide">{currentMonth}</span>
          <button 
            className="p-1 px-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg font-bold"
            onClick={() => setCurrentMonth("June 2026")}
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 4-Column quick read status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs transition-transform hover:scale-[1.01]">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest block uppercase">{m.label}</span>
            <span className="font-display font-extrabold text-2xl text-slate-800 block mt-1">{m.value}</span>
            
            <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-600 mt-2 bg-emerald-50/50 px-2.5 py-0.5 rounded-full w-max border border-emerald-100">
              <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
              {m.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Grid of Chart & J.A.R.V.I.S Prognosis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Completion Bar Chart representation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display font-bold text-slate-800 text-sm">Chronological Flow Metrics</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Completions percentage by days of current sequence week.</p>
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '11px', fontFamily: 'Plus Jakarta Sans' }}
                />
                <Bar dataKey="completion" radius={[8, 8, 0, 0]} maxBarSize={38}>
                  {barChartData.map((entry, index) => {
                    const isToday = entry.day === "SUN"; // highlighted today Sunday in amber
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isToday ? "#F5A623" : "#E2E8F0"} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dark Piggy Custom Insights Panel */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Brain className="w-5 h-5 text-amber-500 animate-pulse" />
              <h3 className="font-display font-bold text-white text-sm">🤖 Cognitive Synthesis Insights</h3>
            </div>

            <div className="space-y-4 divide-y divide-slate-800/80">
              {piggyInsights.map((insight, idx) => (
                <div key={idx} className={`${idx > 0 ? 'pt-4' : ''}`}>
                  <h4 className="font-mono text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-1">
                    {insight.subject}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {insight.observation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 font-mono text-[8px] text-slate-500 uppercase tracking-wider flex justify-between">
            <span>MODEL: GEMINI-3.5-FLASH</span>
            <span>PROBABILITY PROG: OPTIMAL</span>
          </div>
        </div>

      </div>
    </div>
  );
};
