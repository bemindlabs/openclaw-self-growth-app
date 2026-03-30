import { useEffect, useState } from "react";
import { progressApi, type DashboardStats } from "@/api/progress";
import { aiApi, type AiResponse } from "@/api/ai";
import { todosApi, type Todo } from "@/api/todos";
import { healthApi, type HealthSummary } from "@/api/health";
import { habitsApi, type Habit, type HabitLog } from "@/api/habits";
import {
  Flame,
  Target,
  RotateCcw,
  Trophy,
  CheckCircle,
  ListTodo,
  Heart,
  AlertCircle,
  Check,
  Footprints,
  Moon,
  Weight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import Markdown from "@/components/ui/Markdown";

const trendIcons: Record<string, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

function formatHealthValue(type: string, value: number): string {
  if (type === "sleep_minutes") return `${(value / 60).toFixed(1)}h`;
  if (type === "distance_m") return `${(value / 1000).toFixed(1)}km`;
  if (type === "weight_kg") return `${value.toFixed(1)}kg`;
  if (type === "heart_rate") return `${Math.round(value)}bpm`;
  return Math.round(value).toLocaleString();
}

function formatDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff <= 7) return `In ${diff}d`;
  return date;
}

const priorityColors: Record<string, string> = {
  urgent: "text-red-600",
  high: "text-orange-600",
  medium: "text-blue-600",
  low: "text-gray-500",
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [healthSummary, setHealthSummary] = useState<HealthSummary[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Map<number, Set<string>>>(new Map());

  // Quick Coach
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachResult, setCoachResult] = useState<AiResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  // Insights
  const [insightsResult, setInsightsResult] = useState<AiResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Weekly Summary
  const [summaryResult, setSummaryResult] = useState<AiResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    progressApi.getDashboardStats().then(setStats).catch(console.error);
    todosApi.getToday().then(setTodayTodos).catch(console.error);
    healthApi.getSummary().then(setHealthSummary).catch(console.error);

    // Load habits and today's logs
    habitsApi.list().then(async (h) => {
      setHabits(h);
      const logsMap = new Map<number, Set<string>>();
      for (const habit of h) {
        try {
          const logs = await habitsApi.getLogs(habit.id, 1);
          const dates = new Set(logs.map((l: HabitLog) => l.logged_date));
          logsMap.set(habit.id, dates);
        } catch {
          logsMap.set(habit.id, new Set());
        }
      }
      setHabitLogs(logsMap);
    }).catch(console.error);
  }, []);

  async function handleAskCoach() {
    if (!coachQuestion.trim()) return;
    setCoachLoading(true);
    setCoachResult(null);
    setCoachError(null);
    try {
      const res = await aiApi.coach(coachQuestion.trim());
      setCoachResult(res);
    } catch (err) {
      setCoachError(err instanceof Error ? err.message : String(err));
    } finally {
      setCoachLoading(false);
    }
  }

  async function handleInsights() {
    setInsightsLoading(true);
    setInsightsResult(null);
    setInsightsError(null);
    try {
      const res = await aiApi.insights();
      setInsightsResult(res);
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : String(err));
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleWeeklySummary() {
    setSummaryLoading(true);
    setSummaryResult(null);
    setSummaryError(null);
    try {
      const res = await aiApi.summarize("weekly");
      setSummaryResult(res);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : String(err));
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleCompleteTodo(id: number) {
    try {
      await todosApi.complete(id);
      setTodayTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleHabit(habitId: number) {
    try {
      const toggled = await habitsApi.toggle(habitId, today);
      setHabitLogs((prev) => {
        const next = new Map(prev);
        const dates = new Set(next.get(habitId) || []);
        if (toggled) {
          dates.add(today);
        } else {
          dates.delete(today);
        }
        next.set(habitId, dates);
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  }

  if (!stats) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const overdueTodos = todayTodos.filter(
    (t) => t.due_date && t.due_date < today
  );

  const cards = [
    { label: "Streak", value: `${stats.current_streak}d`, icon: Flame, color: "text-orange-500" },
    { label: "Today", value: stats.completions_today, icon: CheckCircle, color: "text-success" },
    { label: "Goals", value: stats.active_goals, icon: Trophy, color: "text-warning" },
    { label: "Todos", value: todayTodos.length, icon: ListTodo, color: "text-violet-500" },
    { label: "Routines", value: stats.active_routines, icon: RotateCcw, color: "text-primary" },
    { label: "Skills", value: stats.total_skills, icon: Target, color: "text-blue-500" },
  ];

  // Pick top health highlights (max 4)
  const healthHighlights = healthSummary.slice(0, 4);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-lg border border-border p-3 flex items-center gap-2"
          >
            <div className={`p-1.5 rounded-md bg-secondary ${card.color}`}>
              <card.icon size={16} />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">{card.value}</p>
              <p className="text-[10px] text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Today's Todos + Habits */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {/* Today's Todos */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <ListTodo size={16} className="text-violet-500" />
            <h3 className="font-semibold text-sm">Today's Todos</h3>
            {overdueTodos.length > 0 && (
              <span className="ml-auto flex items-center gap-1 text-xs text-red-600">
                <AlertCircle size={12} />
                {overdueTodos.length} overdue
              </span>
            )}
          </div>
          {todayTodos.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {todayTodos.slice(0, 8).map((todo) => {
                const overdue = todo.due_date && todo.due_date < today;
                return (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 group"
                  >
                    <button
                      onClick={() => handleCompleteTodo(todo.id)}
                      className="w-4 h-4 rounded border border-muted-foreground/40 hover:border-primary hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <Check size={10} className="opacity-0 group-hover:opacity-100 text-primary" />
                    </button>
                    <span className="text-sm flex-1 truncate">{todo.title}</span>
                    {todo.due_date && (
                      <span
                        className={`text-[10px] flex-shrink-0 ${
                          overdue ? "text-red-600" : "text-muted-foreground"
                        }`}
                      >
                        {formatDate(todo.due_date)}
                      </span>
                    )}
                    <span className={`text-[10px] ${priorityColors[todo.priority] || ""}`}>
                      {todo.priority === "urgent" || todo.priority === "high" ? "!" : ""}
                    </span>
                  </div>
                );
              })}
              {todayTodos.length > 8 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{todayTodos.length - 8} more
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-3 text-center">
              All caught up! No todos due today.
            </p>
          )}
        </div>

        {/* Today's Habits */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-500" />
            <h3 className="font-semibold text-sm">Today's Habits</h3>
            {habits.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                {habits.filter((h) => habitLogs.get(h.id)?.has(today)).length}/{habits.length} done
              </span>
            )}
          </div>
          {habits.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {habits.slice(0, 8).map((habit) => {
                const done = habitLogs.get(habit.id)?.has(today) || false;
                return (
                  <div key={habit.id} className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        done
                          ? "border-green-500 bg-green-500"
                          : "border-muted-foreground/40 hover:border-green-500"
                      }`}
                    >
                      {done && <Check size={10} className="text-white" />}
                    </button>
                    <span
                      className={`text-sm flex-1 truncate ${
                        done ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {habit.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-3 text-center">
              No habits yet. Create one to start tracking.
            </p>
          )}
        </div>
      </div>

      {/* Health Highlights */}
      {healthHighlights.length > 0 && (
        <div className="mt-4 bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-red-500" />
            <h3 className="font-semibold text-sm">Health Snapshot</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {healthHighlights.map((h) => {
              const TrendIcon = trendIcons[h.trend] || Minus;
              return (
                <div key={h.metric_type} className="flex items-center gap-2">
                  <div className="text-muted-foreground">
                    {h.metric_type === "steps" && <Footprints size={14} />}
                    {h.metric_type === "heart_rate" && <Heart size={14} />}
                    {h.metric_type === "sleep_minutes" && <Moon size={14} />}
                    {h.metric_type === "weight_kg" && <Weight size={14} />}
                    {!["steps", "heart_rate", "sleep_minutes", "weight_kg"].includes(h.metric_type) && <Target size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {formatHealthValue(h.metric_type, h.latest_value)}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {h.metric_type.replace("_", " ")}
                      </span>
                      <TrendIcon size={10} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Coach */}
      <div className="mt-4 bg-card rounded-lg border border-border p-4">
        <h3 className="font-semibold text-sm mb-3">Quick Coach</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={coachQuestion}
            onChange={(e) => setCoachQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskCoach()}
            placeholder="Ask your coach anything..."
            className="flex-1 bg-secondary text-sm rounded-md border border-border px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleAskCoach}
            disabled={coachLoading || !coachQuestion.trim()}
            className="bg-primary text-primary-foreground text-sm font-medium rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {coachLoading ? "..." : "Ask"}
          </button>
        </div>
        {coachError && (
          <div className="mt-3 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
            {coachError}
          </div>
        )}
        {coachResult && (
          <div className="mt-3 rounded-md bg-secondary border border-border px-3 py-3">
            <p className="text-xs text-muted-foreground mb-1">{coachResult.model}</p>
            <Markdown className="text-sm">{coachResult.content}</Markdown>
          </div>
        )}
      </div>

      {/* Insights & Weekly Summary side by side */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm">Insights</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                AI-generated observations from your data.
              </p>
            </div>
            <button
              onClick={handleInsights}
              disabled={insightsLoading}
              className="bg-primary text-primary-foreground text-xs font-medium rounded-md px-3 py-1.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {insightsLoading ? "..." : "Generate"}
            </button>
          </div>
          {insightsError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              {insightsError}
            </div>
          )}
          {insightsResult && (
            <div className="rounded-md bg-secondary border border-border px-3 py-3">
              <p className="text-xs text-muted-foreground mb-1">{insightsResult.model}</p>
              <Markdown className="text-sm">{insightsResult.content}</Markdown>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm">Weekly Summary</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Recap of your past week.
              </p>
            </div>
            <button
              onClick={handleWeeklySummary}
              disabled={summaryLoading}
              className="bg-primary text-primary-foreground text-xs font-medium rounded-md px-3 py-1.5 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {summaryLoading ? "..." : "Generate"}
            </button>
          </div>
          {summaryError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              {summaryError}
            </div>
          )}
          {summaryResult && (
            <div className="rounded-md bg-secondary border border-border px-3 py-3">
              <p className="text-xs text-muted-foreground mb-1">{summaryResult.model}</p>
              <Markdown className="text-sm">{summaryResult.content}</Markdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
