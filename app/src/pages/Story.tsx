import { useState } from "react";
import { storyApi, type StoryGenerationResult } from "@/api/story";
import { Sparkles, Wand2 } from "lucide-react";
import Markdown from "@/components/ui/Markdown";

const toneOptions = ["encouraging", "reflective", "cinematic", "playful", "calm"];

export default function StoryPage() {
  const [prompt, setPrompt] = useState(
    "Write a short story about becoming a little better each day."
  );
  const [tone, setTone] = useState("encouraging");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await storyApi.generate({ prompt, tone, max_tokens: 500 });
      setResult(response);
    } catch (e) {
      setError(String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-primary" size={22} />
        <h2 className="text-2xl font-bold">Story Lab</h2>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Story prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
            placeholder="Describe the kind of story you want..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <div className="flex gap-2 flex-wrap">
            {toneOptions.map((option) => (
              <button
                key={option}
                onClick={() => setTone(option)}
                className={`px-3 py-1 rounded-full text-xs capitalize ${
                  tone === option
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
        >
          <Wand2 size={16} />
          {loading ? "Generating..." : "Generate story"}
        </button>

        <p className="text-xs text-muted-foreground">
          Uses your tracked skills, learning items, routines, and goals as context.
        </p>
      </div>

      {error && (
        <div className="mt-4 bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold">Generated story</h3>
              <span className="text-xs text-muted-foreground">
                {result.provider} · {result.model}
              </span>
            </div>
            <Markdown className="text-sm leading-7">{result.story}</Markdown>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Context used</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
              {result.context_summary.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
