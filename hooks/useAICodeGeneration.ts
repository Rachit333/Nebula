import { useState, useCallback, useEffect } from "react";
import { useProjectStore } from "@/hooks/useProjectStore";

// ── Types ─────────────────────────────────────────────────────────────────────

type MergeStrategy = "replace" | "append" | "patch";

export interface PatchOperation {
  find: string;     // exact string to locate in the existing file
  replace: string;  // replacement (empty string = delete the found text)
}

interface ChatMessage {
  id: string;
  type: "prompt" | "response" | "clarification";
  content: string;
  timestamp: number;
  files?: Record<string, string>;
  error?: string;
  mergeStrategy?: Record<string, MergeStrategy>;
  patches?: Record<string, PatchOperation[]>;
  questions?: Array<{
    id: string;
    label: string;
    type: "single-select" | "multi-select" | "text" | "textarea";
    options?: string[];
    placeholder?: string;
    required?: boolean;
  }>;
  todos?: Array<{
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    tags?: string[];
    completed: boolean;
  }>;
}

interface AIGenerationOptions {
  prompt: string;
}

interface UseAICodeGenerationReturn {
  isLoading: boolean;
  error: string | null;
  generatedFiles: Record<string, string> | null;
  chatHistory: ChatMessage[];
  generateCode: (options: AIGenerationOptions) => Promise<void>;
  clearHistory: () => void;
}

// ── Patch engine ──────────────────────────────────────────────────────────────

function applyPatches(source: string, ops: PatchOperation[]): string {
  let result = source;
  for (const op of ops) {
    if (!result.includes(op.find)) {
      console.warn(`[patch] find string not found, skipping:\n${op.find}`);
      continue;
    }
    // Replace only first occurrence to avoid unintended multi-replacements
    result = result.replace(op.find, op.replace);
  }
  return result;
}

// ── Per-project storage ───────────────────────────────────────────────────────

function chatStorageKey(): string {
  const projectId = useProjectStore.getState().currentProjectId;
  return `nebula:chat:${projectId ?? "default"}`;
}

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(chatStorageKey());
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function persistHistory(history: ChatMessage[]): void {
  try {
    localStorage.setItem(chatStorageKey(), JSON.stringify(history));
  } catch {
    // quota exceeded — fail silently
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAICodeGeneration(): UseAICodeGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string> | null>(null);

  // Rehydrate from the per-project key on first render
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => loadHistory());

  // When the active project changes, swap to that project's conversation
  useEffect(() => {
    const unsub = useProjectStore.subscribe((state, prev) => {
      if (state.currentProjectId !== prev.currentProjectId) {
        setChatHistory(loadHistory());
      }
    });
    return unsub;
  }, []);

  // Persist on every change
  useEffect(() => {
    persistHistory(chatHistory);
  }, [chatHistory]);

  const generateCode = useCallback(
    async (options: AIGenerationOptions) => {
      const { prompt } = options;
      const setFile = useProjectStore.getState().setFile;

      if (!prompt.trim()) {
        setError("Please enter a prompt");
        return;
      }

      setIsLoading(true);
      setError(null);
      setGeneratedFiles(null);

      const promptMessage: ChatMessage = {
        id: `prompt-${Date.now()}`,
        type: "prompt",
        content: prompt,
        timestamp: Date.now(),
      };

      // Show the user's message immediately
      setChatHistory((prev) => [...prev, promptMessage]);

      try {
        // Build conversation context (last 6 msgs, already chronological)
        let contextPrompt = prompt;
        if (chatHistory.length > 0) {
          const ctx = chatHistory
            .slice(-6)
            .map((msg) => {
              if (msg.type === "prompt") return `User: ${msg.content}`;
              const files = msg.files ? Object.keys(msg.files).join(", ") : "none";
              return `Assistant: Generated ${files}`;
            })
            .join("\n");
          contextPrompt = `Previous conversation:\n${ctx}\n\nNew request: ${prompt}`;
        }

        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: contextPrompt }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API error: ${response.statusText}`);
        }

        const data = await response.json();
        let responseFiles: Record<string, string> = {};

        // ── Files response ──────────────────────────────────────────────────
        if (data.files && typeof data.files === "object" && Object.keys(data.files).length > 0) {
          const filesObj   = data.files     as Record<string, string>;
          const strategies = (data.mergeStrategy || {}) as Record<string, MergeStrategy>;
          const patchMap   = (data.patches   || {}) as Record<string, PatchOperation[]>;

          Object.entries(filesObj).forEach(([filePath, fileContent]) => {
            const path       = filePath.startsWith("/") ? filePath : `/${filePath}`;
            const contentStr = typeof fileContent === "string" ? fileContent : String(fileContent);
            if (!contentStr.trim()) return;

            const strategy = strategies[filePath] ?? strategies[path] ?? "replace";

            if (strategy === "patch") {
              const ops = patchMap[filePath] ?? patchMap[path] ?? [];
              if (ops.length === 0) {
                console.warn(`[patch] no ops for ${path}, falling back to replace`);
                setFile(path, contentStr);
                responseFiles[path] = contentStr;
              } else {
                const existing = useProjectStore.getState().files[path] ?? "";
                const patched  = applyPatches(existing, ops);
                setFile(path, patched);
                responseFiles[path] = patched;
              }

            } else if (strategy === "append") {
              const existing = useProjectStore.getState().files[path] ?? "";
              const merged   = existing ? `${existing}\n\n${contentStr}` : contentStr;
              setFile(path, merged);
              responseFiles[path] = merged;

            } else {
              // replace (default)
              setFile(path, contentStr);
              responseFiles[path] = contentStr;
            }
          });

          setGeneratedFiles(responseFiles);

        // ── Single-file backward-compat ─────────────────────────────────────
        } else if (data.code || data.content) {
          const generatedCode = data.code || data.content;
          if (!generatedCode.trim()) throw new Error("No code generated");
          const filePath = data.filePath || "/src/App.js";
          setFile(filePath, generatedCode);
          responseFiles = { [filePath]: generatedCode };
          setGeneratedFiles(responseFiles);

        // ── Clarification (no files) ────────────────────────────────────────
        } else if ((data.chat || data.questions) && (!data.files || Object.keys(data.files).length === 0)) {
          const clarificationMessage: ChatMessage = {
            id: `clarification-${Date.now()}`,
            type: "clarification",
            content: data.chat || "Please answer the following questions:",
            timestamp: Date.now(),
            questions: data.questions,
            todos: data.todos ?? [],
          };
          setChatHistory((prev) => [...prev, clarificationMessage]);
          setIsLoading(false);
          return;

        } else {
          throw new Error("Invalid response format from AI");
        }

        const responseMessage: ChatMessage = {
          id: `response-${Date.now()}`,
          type: "response",
          content: data.chat || "Code generated successfully!",
          timestamp: Date.now(),
          files: responseFiles,
          mergeStrategy: data.mergeStrategy,
          patches: data.patches,
          todos: data.todos ?? [],
        };
        setChatHistory((prev) => [...prev, responseMessage]);

      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to generate code";
        setError(msg);
        setChatHistory((prev) => [
          ...prev,
          { id: `error-${Date.now()}`, type: "response", content: msg, timestamp: Date.now(), error: msg },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatHistory]
  );

  return {
    isLoading,
    error,
    generatedFiles,
    chatHistory,
    generateCode,
    clearHistory: () => {
      setChatHistory([]);
      try { localStorage.removeItem(chatStorageKey()); } catch {}
    },
  };
}