import { useState, useCallback } from "react";
import { useProjectStore } from "@/hooks/useProjectStore";

interface ChatMessage {
  id: string;
  type: "prompt" | "response" | "clarification";
  content: string;
  timestamp: number;
  files?: Record<string, string>;
  error?: string;
  mergeStrategy?: Record<string, "replace" | "append">;
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

export function useAICodeGeneration(): UseAICodeGenerationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<Record<
    string,
    string
  > | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const generateCode = useCallback(
    async (options: AIGenerationOptions) => {
      const { prompt } = options;
      // Get setFile directly from store inside the callback to avoid stale references
      const setFile = useProjectStore.getState().setFile;

      console.log("🚀 generateCode called with prompt:", prompt);
      console.log("🚀 setFile function retrieved from store:", typeof setFile);

      if (!prompt.trim()) {
        setError("Please enter a prompt");
        return;
      }

      setIsLoading(true);
      setError(null);
      setGeneratedFiles(null);

      // Add user prompt to history
      const promptMessage: ChatMessage = {
        id: `prompt-${Date.now()}`,
        type: "prompt",
        content: prompt,
        timestamp: Date.now(),
      };

      try {
        // Build context from chat history if available
        let contextPrompt = prompt;
        if (chatHistory.length > 0) {
          // Format previous conversation for context
          const conversationContext = chatHistory
            .slice() // Make a copy
            .reverse() // Reverse to get chronological order
            .slice(0, 6) // Take last 6 messages (3 back-and-forth exchanges)
            .map((msg) => {
              if (msg.type === "prompt") {
                return `User: ${msg.content}`;
              } else {
                const filesList = msg.files
                  ? Object.keys(msg.files).join(", ")
                  : "none";
                return `Assistant: Generated ${filesList}`;
              }
            })
            .join("\n");

          contextPrompt = `Previous conversation:\n${conversationContext}\n\nNew request: ${prompt}`;

          console.log("📋 Chat History Context:", {
            historyLength: chatHistory.length,
            conversationContext,
            fullContextPrompt: contextPrompt,
          });
        } else {
          console.log(
            "📝 No chat history - sending standalone prompt:",
            prompt
          );
        }

        // Call your Gemini API
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: contextPrompt,
          }),
        });

        console.log("📤 API Response Status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `API error: ${response.statusText}`
          );
        }

        const data = await response.json();
        let responseFiles: Record<string, string> = {};

        console.log("📊 Full API response:", {
          hasFiles: !!data.files,
          filesCount: data.files ? Object.keys(data.files).length : 0,
          hasChat: !!data.chat,
          hasQuestions: !!data.questions,
          chatPreview: data.chat?.substring(0, 50),
        });

        if (!Array.isArray(data.todos)) {
          console.error("❌ AI response missing TODOS", data);
        } else {
          console.log("🧩 Todos from AI:", {
            hasTodos: Array.isArray(data.todos),
            todosCount: data.todos?.length ?? 0,
            todos: data.todos,
          });
        }

        // Check if response has files - process those first
        if (
          data.files &&
          typeof data.files === "object" &&
          Object.keys(data.files).length > 0
        ) {
          console.log("✅ Response has files, processing them");
          const filesObj = data.files as Record<string, string>;
          const fileEntries = Object.entries(filesObj);
          const mergeStrategy = data.mergeStrategy || {};

          if (fileEntries.length === 0) {
            throw new Error("No files generated");
          }

          console.log("📁 Generated files with merge strategy:", mergeStrategy);
          console.log(
            "📁 File entries to process:",
            fileEntries.map(([p, c]) => ({
              path: p,
              contentLength: String(c).length,
            }))
          );

          // Create all files from the response
          fileEntries.forEach(([filePath, fileContent]) => {
            const normalizedPath = filePath.startsWith("/")
              ? filePath
              : `/${filePath}`;
            const contentStr =
              typeof fileContent === "string"
                ? fileContent
                : String(fileContent);

            console.log(`🔧 Processing file:`, {
              originalPath: filePath,
              normalizedPath,
              contentLength: contentStr.length,
              hasContent: !!contentStr.trim(),
            });

            if (contentStr.trim()) {
              const strategy =
                mergeStrategy[filePath] ||
                mergeStrategy[normalizedPath] ||
                "replace";

              if (strategy === "append") {
                // Merge with existing file
                const files = useProjectStore.getState().files;
                const existingContent = files[normalizedPath] || "";
                const mergedContent = existingContent
                  ? `${existingContent}\n\n${contentStr}`
                  : contentStr;
                console.log(
                  `📝 About to append to ${normalizedPath}. Calling setFile...`
                );
                console.log(
                  `📝 Existing content length:`,
                  existingContent.length
                );
                console.log(`📝 New content length:`, contentStr.length);
                setFile(normalizedPath, mergedContent);

                // Verify file was set
                const verifyAfterAppend =
                  useProjectStore.getState().files[normalizedPath];
                console.log(
                  `✅ After append, file exists in store:`,
                  !!verifyAfterAppend,
                  `length: ${verifyAfterAppend?.length || 0}`
                );

                responseFiles[normalizedPath] = mergedContent;
                console.log(`📝 Appended to ${normalizedPath}`);
              } else {
                // Replace entire file (default)
                console.log(
                  `✏️ About to replace ${normalizedPath}. Calling setFile...`
                );
                console.log(`✏️ Content length:`, contentStr.length);
                setFile(normalizedPath, contentStr);

                // Verify file was set
                const verifyAfterReplace =
                  useProjectStore.getState().files[normalizedPath];
                console.log(
                  `✅ After replace, file exists in store:`,
                  !!verifyAfterReplace,
                  `length: ${verifyAfterReplace?.length || 0}`
                );

                responseFiles[normalizedPath] = contentStr;
                console.log(`✏️ Replaced ${normalizedPath}`);
              }
            } else {
              console.log(`⚠️ Skipping ${normalizedPath} - empty content`);
            }
          });

          console.log(
            "📊 Final responseFiles after processing:",
            Object.keys(responseFiles)
          );

          // Verify files were actually set in store
          const storeState = useProjectStore.getState();
          console.log("🔍 Zustand store files after setFile calls:", {
            storeFileCount: Object.keys(storeState.files).length,
            storeFileKeys: Object.keys(storeState.files),
            responseFileCount: Object.keys(responseFiles).length,
            responseFileKeys: Object.keys(responseFiles),
          });

          // Double check each generated file is in the store
          Object.keys(responseFiles).forEach((filePath) => {
            const inStore = storeState.files[filePath];
            console.log(`🔎 File ${filePath}:`, {
              inStore: !!inStore,
              storedLength: inStore?.length || 0,
              responseLength: responseFiles[filePath].length,
              firstChars: inStore?.substring(0, 50) || "NOT FOUND",
            });
          });

          setGeneratedFiles(responseFiles);
        } else if (data.code || data.content) {
          // Handle single file response (backward compatibility)
          const generatedCode = data.code || data.content;
          if (!generatedCode.trim()) {
            throw new Error("No code generated");
          }
          const filePath = data.filePath || "/src/App.js";
          setFile(filePath, generatedCode);
          responseFiles = { [filePath]: generatedCode };
          setGeneratedFiles(responseFiles);
        } else if (
          (data.chat || data.questions) &&
          (!data.files || Object.keys(data.files).length === 0)
        ) {
          // Handle chat-only clarification (no files)
          console.log("💬 Received clarification-only response (no files)");
          if (data.chat) {
            console.log("💬 Chat message:", data.chat);
          }
          if (data.questions) {
            console.log("❓ Received", data.questions.length, "questions");
          }

          const clarificationMessage: ChatMessage = {
            id: `clarification-${Date.now()}`,
            type: "clarification",
            content: data.chat || "Please answer the following questions:",
            timestamp: Date.now(),
            questions: data.questions,
            todos: data.todos ?? [],
          };

          setChatHistory((prev) => [
            promptMessage,
            clarificationMessage,
            ...prev,
          ]);
          setError(null);
          setIsLoading(false);
          return;
        } else {
          throw new Error("Invalid response format from AI");
        }

        // Add AI response to history
        const responseMessage: ChatMessage = {
          id: `response-${Date.now()}`,
          type: "response",
          content: data.chat || "Code generated successfully!",
          timestamp: Date.now(),
          files: responseFiles,
          mergeStrategy: data.mergeStrategy,
          todos: data.todos ?? [],
        };

        setChatHistory((prev) => [promptMessage, responseMessage, ...prev]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate code";
        setError(errorMessage);
        console.error("Code generation error:", err);

        // Add error message to history
        const errorMessage_obj: ChatMessage = {
          id: `error-${Date.now()}`,
          type: "response",
          content: errorMessage,
          timestamp: Date.now(),
          error: errorMessage,
        };

        setChatHistory((prev) => [promptMessage, errorMessage_obj, ...prev]);
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
    clearHistory: () => setChatHistory([]),
  };
}
