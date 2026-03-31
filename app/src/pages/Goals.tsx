import { useEffect, useState } from "react";
import { goalsApi, type Goal } from "@/api/goals";
import { Plus, Trash2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  paused: "bg-secondary text-secondary-foreground",
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [filter, setFilter] = useState<string | undefined>();

  const loadGoals = () => {
    goalsApi.list(filter).then(setGoals).catch(console.error);
  };

  useEffect(loadGoals, [filter]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await goalsApi.create({
      title: title.trim(),
      description: description.trim() || undefined,
      target_date: targetDate || undefined,
    });
    setTitle("");
    setDescription("");
    setTargetDate("");
    setShowForm(false);
    loadGoals();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await goalsApi.update(id, { status });
    loadGoals();
  };

  const handleDelete = async (id: number) => {
    await goalsApi.delete(id);
    loadGoals();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {[undefined, "active", "completed", "paused"].map((s) => (
          <button
            key={s ?? "all"}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1 rounded-full text-xs transition-colors",
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {s ?? "All"}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Title</label>
            <input
              type="text"
              placeholder="Goal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Description</label>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90 transition-opacity">
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-md text-sm hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">No goals yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Trophy size={18} className="text-warning mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={goal.status}
                        onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                        className={cn(
                          "px-2 py-0.5 rounded text-xs border-0",
                          statusColors[goal.status] || ""
                        )}
                        aria-label={`Status for: ${goal.title}`}
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="paused">Paused</option>
                      </select>
                      {goal.target_date && (
                        <span className="text-xs text-muted-foreground">Target: {goal.target_date}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="p-2 text-destructive hover:bg-secondary rounded-md transition-colors"
                  aria-label={`Delete: ${goal.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
