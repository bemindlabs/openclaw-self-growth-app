import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { ScanLine } from "lucide-react";

interface OcrButtonProps {
  mode?: "general" | "lab" | "receipt";
  onResult: (text: string) => void;
  label?: string;
  className?: string;
}

export default function OcrButton({ mode = "general", onResult, label, className = "" }: OcrButtonProps) {
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    const path = await open({
      multiple: false,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp"] }],
    });
    if (!path) return;

    setScanning(true);
    try {
      const text = await invoke<string>("ocr_extract", { imagePath: path, mode });
      onResult(text);
    } catch (e) {
      alert(`OCR failed: ${e}`);
    } finally {
      setScanning(false);
    }
  };

  return (
    <button
      onClick={handleScan}
      disabled={scanning}
      className={`flex items-center gap-1 px-3 py-2 border border-border rounded-md text-sm disabled:opacity-50 hover:bg-secondary/50 transition-colors ${className}`}
    >
      <ScanLine size={14} className={scanning ? "animate-pulse" : ""} />
      {scanning ? "Scanning..." : label || "Scan Image"}
    </button>
  );
}
