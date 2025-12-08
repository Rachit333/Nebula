import { useState, useCallback } from "react";
import { useProjectStore } from "@/hooks/useProjectStore";

interface ChatMessage {
  id: string;
  type: "prompt" | "response";
  content: string;
  timestamp: number;
  files?: Record<string, string>;
  error?: string;
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
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string> | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const setFile = useProjectStore((s) => s.setFile);

  const generateCode = useCallback(
    async (options: AIGenerationOptions) => {
      const { prompt } = options;

      console.log("🚀 generateCode called with prompt:", prompt);

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
                const filesList = msg.files ? Object.keys(msg.files).join(", ") : "none";
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
          console.log("📝 No chat history - sending standalone prompt:", prompt);
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

        // Handle single file response (backward compatibility)
        if (data.code || data.content) {
          const generatedCode = data.code || data.content;
          if (!generatedCode.trim()) {
            throw new Error("No code generated");
          }
          const filePath = data.filePath || "/src/App.js";
          setFile(filePath, generatedCode);
          responseFiles = { [filePath]: generatedCode };
          setGeneratedFiles(responseFiles);
        }
        // Handle multiple files response
        else if (data.files && typeof data.files === "object") {
          const filesObj = data.files as Record<string, string>;
          const fileEntries = Object.entries(filesObj);

          if (fileEntries.length === 0) {
            throw new Error("No files generated");
          }

          // Create all files from the response
          fileEntries.forEach(([filePath, fileContent]) => {
            const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
            const contentStr = typeof fileContent === "string" ? fileContent : String(fileContent);

            if (contentStr.trim()) {
              setFile(normalizedPath, contentStr);
              responseFiles[normalizedPath] = contentStr;
            }
          });

          setGeneratedFiles(responseFiles);
        } else {
          throw new Error("Invalid response format from AI");
        }

        // Add AI response to history
        const responseMessage: ChatMessage = {
          id: `response-${Date.now()}`,
          type: "response",
          content: "Code generated successfully!",
          timestamp: Date.now(),
          files: responseFiles,
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
    [setFile, chatHistory]
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
