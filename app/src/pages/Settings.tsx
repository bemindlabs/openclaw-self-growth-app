import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";

interface LlmSettingsState {
  endpoint: string;
  token: string;
}

interface GfitSettingsState {
  clientId: string;
  clientSecret: string;
}

const defaultLlmSettings: LlmSettingsState = {
  endpoint: "",
  token: "",
};

const defaultGfitSettings: GfitSettingsState = {
  clientId: "",
  clientSecret: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<[string, string][]>([]);
  const [llmSettings, setLlmSettings] = useState<LlmSettingsState>(defaultLlmSettings);
  const [gfitSettings, setGfitSettings] = useState<GfitSettingsState>(defaultGfitSettings);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    llm_endpoint?: string;
    available_models?: string[];
    error?: string;
  } | null>(null);

  const refreshSettings = async () => {
    const allSettings = await invoke<[string, string][]>("get_all_app_settings");
    setSettings(allSettings);

    const settingsMap = new Map(allSettings);
    setLlmSettings({
      endpoint: settingsMap.get("llm_endpoint") ?? defaultLlmSettings.endpoint,
      token: settingsMap.get("llm_token") ?? defaultLlmSettings.token,
    });
    setGfitSettings({
      clientId: settingsMap.get("gfit_client_id") ?? defaultGfitSettings.clientId,
      clientSecret: settingsMap.get("gfit_client_secret") ?? defaultGfitSettings.clientSecret,
    });
  };

  useEffect(() => {
    refreshSettings().catch(console.error);
  }, []);

  const showTemporaryMessage = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveLlmSettings = async () => {
    const entries: Array<[string, string]> = [
      ["llm_endpoint", llmSettings.endpoint],
      ["llm_token", llmSettings.token],
    ];

    for (const [key, value] of entries) {
      await invoke("set_app_setting", { key, value });
    }

    await refreshSettings();
    showTemporaryMessage("Saved LLM settings.");
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await invoke<{
        ok: boolean;
        llm_endpoint?: string;
        available_models?: string[];
        error?: string;
      }>("test_ai_gateway_connection");
      setTestResult(result);
    } catch (e) {
      setTestResult({ ok: false, error: String(e) });
    } finally {
      setTesting(false);
    }
  };

  const handleResetSettings = async () => {
    await invoke("reset_app_settings");
    setConfirmReset(false);
    await refreshSettings();
    showTemporaryMessage("All settings reset to defaults.");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-1">LLM Connection</h3>
            <p className="text-xs text-muted-foreground">
              Configure the LLM endpoint for AI coaching, insights, and stories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Endpoint</label>
              <input
                type="url"
                placeholder="http://127.0.0.1:18789/v1"
                value={llmSettings.endpoint}
                onChange={(e) =>
                  setLlmSettings((current) => ({ ...current, endpoint: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gateway Token</label>
              <input
                type="password"
                placeholder="Gateway token"
                value={llmSettings.token}
                onChange={(e) =>
                  setLlmSettings((current) => ({ ...current, token: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveLlmSettings}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Save LLM settings
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 border border-border rounded-md text-sm disabled:opacity-50"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
          </div>

          {testResult && (
            <div
              className={`rounded-md p-3 text-sm ${
                testResult.ok
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {testResult.ok ? (
                <div className="space-y-1">
                  <p className="font-medium">Connected successfully</p>
                  <p className="text-xs opacity-80">
                    Endpoint: {testResult.llm_endpoint}
                  </p>
                  {testResult.available_models && testResult.available_models.length > 0 && (
                    <p className="text-xs opacity-80">
                      Available: {testResult.available_models.join(", ")}
                    </p>
                  )}
                </div>
              ) : (
                <p>{testResult.error}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div>
            <h3 className="font-medium mb-1">Google Fit</h3>
            <p className="text-xs text-muted-foreground">
              Configure OAuth credentials for Google Fit sync. Create a Desktop
              app in Google Cloud Console with Fitness API enabled.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">Client ID</label>
              <input
                type="text"
                placeholder="your-client-id.apps.googleusercontent.com"
                value={gfitSettings.clientId}
                onChange={(e) =>
                  setGfitSettings((c) => ({ ...c, clientId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Client Secret</label>
              <input
                type="password"
                placeholder="Client secret"
                value={gfitSettings.clientSecret}
                onChange={(e) =>
                  setGfitSettings((c) => ({ ...c, clientSecret: e.target.value }))
                }
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
              />
            </div>
          </div>

          <button
            onClick={async () => {
              const entries: [string, string][] = [
                ["gfit_client_id", gfitSettings.clientId],
                ["gfit_client_secret", gfitSettings.clientSecret],
              ];
              for (const [key, value] of entries) {
                await invoke("set_app_setting", { key, value });
              }
              await refreshSettings();
              showTemporaryMessage("Saved Google Fit settings.");
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Save Google Fit settings
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div>
            <h3 className="font-medium mb-1">Backup & Restore</h3>
            <p className="text-xs text-muted-foreground">
              Export your entire database to a file, or restore from a previous backup.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={async () => {
                const path = await save({
                  defaultPath: `bemind-growth-backup-${new Date().toISOString().split("T")[0]}.db`,
                  filters: [{ name: "SQLite Database", extensions: ["db"] }],
                });
                if (path) {
                  try {
                    await invoke("export_backup", { destPath: path });
                    showTemporaryMessage(`Backup saved to ${path}`);
                  } catch (e) {
                    showTemporaryMessage(`Backup failed: ${e}`);
                  }
                }
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Export Backup
            </button>
            <button
              onClick={async () => {
                const path = await open({
                  multiple: false,
                  filters: [{ name: "SQLite Database", extensions: ["db"] }],
                });
                if (path) {
                  const confirmed = window.confirm(
                    "This will replace ALL your current data with the backup. This cannot be undone. Continue?"
                  );
                  if (confirmed) {
                    try {
                      await invoke("import_backup", { srcPath: path });
                      showTemporaryMessage("Backup restored. Please restart the app.");
                    } catch (e) {
                      showTemporaryMessage(`Restore failed: ${e}`);
                    }
                  }
                }
              }}
              className="px-4 py-2 border border-border rounded-md text-sm"
            >
              Restore from Backup
            </button>
            <button
              onClick={async () => {
                try {
                  const info = await invoke<{ db_path: string; size_display: string }>("get_backup_info");
                  showTemporaryMessage(`DB: ${info.db_path} (${info.size_display})`);
                } catch (e) {
                  showTemporaryMessage(`${e}`);
                }
              }}
              className="px-4 py-2 border border-border rounded-md text-sm"
            >
              DB Info
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium mb-1">Reset Settings</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Clear all stored settings and revert to defaults.
          </p>
          {confirmReset ? (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-destructive">Are you sure?</span>
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm"
              >
                Yes, reset all
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 border border-border rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-4 py-2 border border-destructive text-destructive rounded-md text-sm"
            >
              Reset to defaults
            </button>
          )}
        </div>

        {saveMessage && (
          <div className="bg-success/10 text-success rounded-md p-3 text-sm">{saveMessage}</div>
        )}

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium mb-3">About</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Self Growth v{__APP_VERSION__}</p>
            <p>Self-development tracking app with AI-powered recommendations.</p>
            <p>Data is stored locally on your device.</p>
          </div>
        </div>

        {settings.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Stored Settings</h3>
            <div className="space-y-2">
              {settings.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-mono text-xs break-all text-right">
                    {key.includes("token") ? "••••••••" : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
