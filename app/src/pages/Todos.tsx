import { useEffect, useState } from "react";
import { todosApi, type Todo } from "@/api/todos";
import {
  ListTodo,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";

type FilterTab = "all" | "today" | "overdue" | "completed";

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: "Urgent", color: "text-red-600", bg: "bg-red-100" },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-100" },
  medium: { label: "Medium", color: "text-blue-600", bg: "bg-blue-100" },
  low: { label: "Low", color: "text-gray-500", bg: "bg-gray-100" },
};

function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.status === "completed" || todo.status === "cancelled") return false;
  return todo.due_date < new Date().toISOString().slice(0, 10);
}

function formatDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < -1) return `${Math.abs(diff)}d overdue`;
  if (diff <= 7) return `In ${diff}d`;
  return date;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterTab>("today");
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("");

  const loadTodos = async () => {
    try {
      let data: Todo[];
      switch (filter) {
        case "today":
          data = await todosApi.getToday();
          break;
        case "overdue":
          data = await todosApi.getOverdue();
          break;
        case "completed":
          data = await todosApi.list("completed");
          break;
        default:
          data = await todosApi.list();
          break;
      }
      setTodos(data);
    } catch (e) {
      setError(String(e));
    }
  };

  useEffect(() => {
    loadTodos();
  }, [filter]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await todosApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
        priority,
        category: category.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      setPriority("medium");
      setCategory("");
      setShowForm(false);
      await loadTodos();
    } catch (e) {
      setError(String(e));
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await todosApi.complete(id);
      await loadTodos();
    } catch (e) {
      setError(String(e));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await todosApi.delete(id);
      await loadTodos();
    } catch (e) {
      setError(String(e));
    }
  };

  const activeTodos = todos.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  );
  const completedTodos = todos.filter((t) => t.status === "completed");

  const displayTodos = filter === "completed" ? completedTodos : activeTodos;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Todos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          <Plus size={16} />
          Add Todo
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 mb-4 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            dismiss
          </button>
        </div>
      )}

      {/* Quick Add Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background resize-none"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2 py-1.5 border border-border rounded-md text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Reminder Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-2 py-1.5 border border-border rounded-md text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-2 py-1.5 border border-border rounded-md text-sm bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. work, personal"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2 py-1.5 border border-border rounded-md text-sm bg-background"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!title.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
            >
              Create Todo
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-border rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4">
        {(
          [
            { key: "today", label: "Today" },
            { key: "all", label: "All" },
            { key: "overdue", label: "Overdue" },
            { key: "completed", label: "Completed" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Todo List */}
      {displayTodos.length > 0 ? (
        <div className="space-y-2">
          {displayTodos.map((todo) => {
            const pc = priorityConfig[todo.priority] || priorityConfig.medium;
            const overdue = isOverdue(todo);
            return (
              <div
                key={todo.id}
                className={`bg-card border rounded-lg p-3 flex items-start gap-3 ${
                  overdue ? "border-red-300" : "border-border"
                }`}
              >
                {/* Checkbox */}
                {todo.status !== "completed" ? (
                  <button
                    onClick={() => handleComplete(todo.id)}
                    className="mt-0.5 w-5 h-5 rounded border-2 border-muted-foreground/40 hover:border-primary hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="Mark complete"
                  >
                    <Check size={12} className="opacity-0 hover:opacity-100 text-primary" />
                  </button>
                ) : (
                  <div className="mt-0.5 w-5 h-5 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-medium text-sm ${
                        todo.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {todo.title}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${pc.bg} ${pc.color}`}
                    >
                      {pc.label}
                    </span>
                    {todo.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                        {todo.category}
                      </span>
                    )}
                  </div>
                  {todo.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {todo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {todo.due_date && (
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {overdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
                        {formatDate(todo.due_date)}
                      </span>
                    )}
                    {todo.due_time && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {todo.due_time}
                      </span>
                    )}
                    {todo.completed_at && (
                      <span className="text-xs text-muted-foreground">
                        Done {todo.completed_at.slice(0, 10)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <ListTodo size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">
            {filter === "today"
              ? "Nothing due today. You're all caught up!"
              : filter === "overdue"
              ? "No overdue todos. Great job staying on track!"
              : filter === "completed"
              ? "No completed todos yet."
              : "No todos yet. Add one to get started."}
          </p>
        </div>
      )}

      {/* Completed section (when not on completed tab) */}
      {filter !== "completed" && completedTodos.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {completedTodos.length} completed
          </button>
          {showCompleted && (
            <div className="space-y-2 opacity-60">
              {completedTodos.slice(0, 10).map((todo) => (
                <div
                  key={todo.id}
                  className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span className="text-sm line-through text-muted-foreground flex-1">
                    {todo.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {todo.completed_at?.slice(0, 10)}
                  </span>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
