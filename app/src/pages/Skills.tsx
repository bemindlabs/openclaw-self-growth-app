import { useEffect, useState } from "react";
import { skillsApi, type Skill } from "@/api/skills";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

const categories = ["general", "technical", "soft", "health", "creative", "business"];

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [targetLevel, setTargetLevel] = useState(5);

  const loadSkills = () => {
    skillsApi.list().then(setSkills).catch(console.error);
  };

  useEffect(loadSkills, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await skillsApi.create({
      name: name.trim(),
      category,
      target_level: targetLevel,
    });
    setName("");
    setCategory("general");
    setTargetLevel(5);
    setShowForm(false);
    loadSkills();
  };

  const handleLevelChange = async (id: number, current: number, delta: number) => {
    const newLevel = Math.max(0, Math.min(10, current + delta));
    await skillsApi.update(id, { current_level: newLevel });
    loadSkills();
  };

  const handleDelete = async (id: number) => {
    await skillsApi.delete(id);
    loadSkills();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Skills</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
        >
          <Plus size={16} />
          Add Skill
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3">
          <input
            type="text"
            placeholder="Skill name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <div>
            <label className="text-xs text-muted-foreground">Target Level: {targetLevel}</label>
            <input
              type="range"
              min={1}
              max={10}
              value={targetLevel}
              onChange={(e) => setTargetLevel(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Create
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <p className="text-muted-foreground text-sm">No skills tracked yet.</p>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => {
            const percentage = skill.target_level > 0
              ? Math.round((skill.current_level / skill.target_level) * 100)
              : 0;

            return (
              <div key={skill.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{skill.name}</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      {skill.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleLevelChange(skill.id, skill.current_level, -1)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <span className="text-sm font-mono w-16 text-center">
                      {skill.current_level}/{skill.target_level}
                    </span>
                    <button
                      onClick={() => handleLevelChange(skill.id, skill.current_level, 1)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="p-1 text-destructive hover:bg-secondary rounded ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{percentage}% complete</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
