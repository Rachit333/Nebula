// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { useAICodeGeneration } from "@/hooks/useAICodeGeneration";
// import { Button } from "@/components/ui/button";
// import { Loader2, Zap, AlertCircle, CheckCircle, FileCode, Trash2 } from "lucide-react";

// interface AICodeGeneratorProps {
//   onSuccess?: () => void;
// }

// export default function AICodeGenerator({
//   onSuccess,
// }: AICodeGeneratorProps) {
//   const [prompt, setPrompt] = useState("");
//   const { isLoading, error, generatedFiles, chatHistory, generateCode, clearHistory } = useAICodeGeneration();
//   const historyEndRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatHistory]);

//   const handleGenerate = async () => {
//     if (prompt.trim()) {
//       await generateCode({
//         prompt,
//       });
//       setPrompt("");
//     }
//   };

//   const fileCount = generatedFiles ? Object.keys(generatedFiles).length : 0;

//   return (
//     <div className="w-full h-full flex flex-col bg-background">
//       {/* Chat History */}
//       <div className="flex-1 overflow-y-auto space-y-3 p-4 min-h-0">
//         {chatHistory.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-center">
//             <Zap className="w-8 h-8 text-muted-foreground/50 mb-2" />
//             <p className="text-sm text-muted-foreground">No chat history yet.</p>
//             <p className="text-xs text-muted-foreground/70">Start by entering a prompt below.</p>
//           </div>
//         ) : (
//           <>
//             {chatHistory.map((message) => (
//               <div key={message.id} className="space-y-2">
//                 {/* User Prompt */}
//                 {message.type === "prompt" && (
//                   <div className="flex justify-end">
//                     <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm max-w-[80%]">
//                       {message.content}
//                     </div>
//                   </div>
//                 )}

//                 {/* AI Response */}
//                 {message.type === "response" && (
//                   <div className="flex justify-start">
//                     <div className="space-y-2 max-w-[80%]">
//                       {message.error ? (
//                         <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
//                           <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
//                           <p className="text-xs text-destructive">{message.error}</p>
//                         </div>
//                       ) : (
//                         <>
//                           <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
//                             <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                             <p className="text-xs text-foreground">{message.content}</p>
//                           </div>
//                           {message.files && Object.keys(message.files).length > 0 && (
//                             <div className="ml-6 space-y-1">
//                               {Object.keys(message.files).map((filePath) => (
//                                 <div key={filePath} className="flex items-center gap-2">
//                                   <FileCode className="w-3 h-3 text-green-600" />
//                                   <span className="text-xs text-muted-foreground font-mono">{filePath}</span>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//             <div ref={historyEndRef} />
//           </>
//         )}
//       </div>

//       {/* Input Area */}
//       <div className="relative border-t border-border bg-background p-4 space-y-3 shrink-0">
//         <div>
//           <textarea
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             placeholder="What do you want to build?"
//             className="w-full h-20 px-3 py-2 text-sm rounded-md bg-background border border-input text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
//             disabled={isLoading}
//             onKeyDown={(e) => {
//               if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
//                 handleGenerate();
//               }
//             }}
//           />
//           <p className="text-xs text-muted-foreground mt-1">Ctrl+Enter to generate</p>
//         </div>

//         <div className="flex gap-2">
//           <Button
//             onClick={handleGenerate}
//             disabled={isLoading || !prompt.trim()}
//             className="flex-1"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Generating...
//               </>
//             ) : (
//               <>
//                 <Zap className="w-4 h-4 mr-2" />
//                 Generate
//               </>
//             )}
//           </Button>

//           {chatHistory.length > 0 && (
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={clearHistory}
//               title="Clear history"
//             >
//               <Trash2 className="w-4 h-4" />
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// -----------------------------------------------

// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { useAICodeGeneration } from "@/hooks/useAICodeGeneration";
// import { Button } from "@/components/ui/button";
// import { Loader2, Zap, AlertCircle, CheckCircle, FileCode, Trash2, Sparkles, Copy, Check } from "lucide-react";

// interface AICodeGeneratorProps {
//   onSuccess?: () => void;
// }

// export default function AICodeGenerator({
//   onSuccess,
// }: AICodeGeneratorProps) {
//   const [prompt, setPrompt] = useState("");
//   const [copiedFile, setCopiedFile] = useState<string | null>(null);
//   const { isLoading, error, generatedFiles, chatHistory, generateCode, clearHistory } = useAICodeGeneration();
//   const historyEndRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatHistory]);

//   // Auto-resize textarea
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
//     }
//   }, [prompt]);

//   const handleGenerate = async () => {
//     if (prompt.trim() && !isLoading) {
//       await generateCode({ prompt });
//       setPrompt("");
//     }
//   };

//   const copyToClipboard = async (filePath: string, content: string) => {
//     try {
//       await navigator.clipboard.writeText(content);
//       setCopiedFile(filePath);
//       setTimeout(() => setCopiedFile(null), 2000);
//     } catch (err) {
//       console.error("Failed to copy:", err);
//     }
//   };

//   const fileCount = generatedFiles ? Object.keys(generatedFiles).length : 0;

//   return (
//     <div className="w-full h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
//       {/* Header Stats */}
//       {chatHistory.length > 0 && (
//         <div className="shrink-0 px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4 text-xs">
//               <div className="flex items-center gap-1.5">
//                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//                 <span className="text-muted-foreground">
//                   {chatHistory.length} {chatHistory.length === 1 ? "message" : "messages"}
//                 </span>
//               </div>
//               {fileCount > 0 && (
//                 <div className="flex items-center gap-1.5 text-primary">
//                   <FileCode className="w-3.5 h-3.5" />
//                   <span className="font-medium">{fileCount} {fileCount === 1 ? "file" : "files"}</span>
//                 </div>
//               )}
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearHistory}
//               className="h-7 text-xs"
//             >
//               <Trash2 className="w-3.5 h-3.5 mr-1.5" />
//               Clear
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Chat History */}
//       <div className="flex-1 overflow-y-auto p-4 min-h-0">
//         {chatHistory.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
//             <div className="relative">
//               <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
//               <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-2xl border border-primary/20">
//                 <Sparkles className="w-12 h-12 text-primary" />
//               </div>
//             </div>
//             <div className="space-y-2 max-w-md">
//               <h3 className="text-lg font-semibold text-foreground">AI Code Generator</h3>
//               <p className="text-sm text-muted-foreground">
//                 Describe what you want to build and I'll generate the code for you.
//               </p>
//             </div>
//             <div className="flex flex-wrap gap-2 justify-center max-w-xl">
//               {["Create a login form", "Build a todo list", "Make a dashboard"].map((example) => (
//                 <button
//                   key={example}
//                   onClick={() => setPrompt(example)}
//                   className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border/50"
//                 >
//                   {example}
//                 </button>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {chatHistory.map((message, idx) => (
//               <div key={message.id} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
//                 {/* User Prompt */}
//                 {message.type === "prompt" && (
//                   <div className="flex justify-end">
//                     <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-[85%] shadow-sm">
//                       {message.content}
//                     </div>
//                   </div>
//                 )}

//                 {/* AI Response */}
//                 {message.type === "response" && (
//                   <div className="flex justify-start">
//                     <div className="space-y-2 max-w-[85%]">
//                       {message.error ? (
//                         <div className="flex items-start gap-2.5 p-4 rounded-2xl rounded-tl-sm bg-destructive/10 border border-destructive/30 shadow-sm">
//                           <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
//                           <p className="text-xs text-destructive leading-relaxed">{message.error}</p>
//                         </div>
//                       ) : (
//                         <>
//                           <div className="flex items-start gap-2.5 p-4 rounded-2xl rounded-tl-sm bg-gradient-to-br from-muted to-muted/50 border border-border/50 shadow-sm">
//                             <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                             <p className="text-xs text-foreground leading-relaxed">{message.content}</p>
//                           </div>
//                           {message.files && Object.keys(message.files).length > 0 && (
//                             <div className="ml-6 space-y-2">
//                               {Object.keys(message.files).map((filePath) => (
//                                 <div
//                                   key={filePath}
//                                   className="group flex items-center justify-between gap-3 p-2.5 rounded-lg bg-background/80 border border-border/50 hover:border-primary/50 hover:bg-background transition-all"
//                                 >
//                                   <div className="flex items-center gap-2 min-w-0">
//                                     <FileCode className="w-3.5 h-3.5 text-primary flex-shrink-0" />
//                                     <span className="text-xs text-foreground font-mono truncate">{filePath}</span>
//                                   </div>
//                                   <button
//                                     onClick={() => copyToClipboard(filePath, message.files![filePath])}
//                                     className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
//                                     title="Copy code"
//                                   >
//                                     {copiedFile === filePath ? (
//                                       <Check className="w-3.5 h-3.5 text-green-600" />
//                                     ) : (
//                                       <Copy className="w-3.5 h-3.5 text-muted-foreground" />
//                                     )}
//                                   </button>
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//         <div ref={historyEndRef} />
//       </div>

//       {/* Input Area */}
//       <div className="relative border-t border-border/50 bg-background/80 backdrop-blur-sm p-4 space-y-3 shrink-0">
//         {/* Global Error Display */}
//         {error && (
//           <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
//             <AlertCircle className="w-4 h-4 flex-shrink-0" />
//             <span>{error}</span>
//           </div>
//         )}

//         <div className="relative">
//           <textarea
//             ref={textareaRef}
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             placeholder="Describe what you want to build..."
//             className="w-full min-h-[60px] max-h-[120px] px-4 py-3 text-sm rounded-xl bg-background border-2 border-input focus:border-primary text-foreground resize-none focus:outline-none transition-colors placeholder:text-muted-foreground/60"
//             disabled={isLoading}
//             onKeyDown={(e) => {
//               if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !e.shiftKey) {
//                 e.preventDefault();
//                 handleGenerate();
//               }
//             }}
//           />
//           <div className="flex items-center justify-between mt-2">
//             <div className="flex items-center gap-2">
//               <p className="text-xs text-muted-foreground">
//                 <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border border-border">Ctrl</kbd>
//                 {" + "}
//                 <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border border-border">Enter</kbd>
//                 {" to send"}
//               </p>
//               {isLoading && (
//                 <div className="flex items-center gap-1.5 text-xs text-primary">
//                   <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                   <span>Generating...</span>
//                 </div>
//               )}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {prompt.length} characters
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// -----------------------------------------------

"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAICodeGeneration } from "@/hooks/useAICodeGeneration";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Zap, AlertCircle, CheckCircle, FileCode, Trash2 } from "lucide-react";

interface AICodeGeneratorProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function AICodeGenerator({
  onSuccess,
  trigger,
}: AICodeGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { isLoading, error, generatedFiles, chatHistory, generateCode, clearHistory } = useAICodeGeneration();
  const historyEndRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Listen for Ctrl+. to open dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition({ x: position.x + deltaX, y: position.y + deltaY });
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the header
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleGenerate = async () => {
    if (prompt.trim()) {
      await generateCode({
        prompt,
      });
      setPrompt("");
    }
  };

  const fileCount = generatedFiles ? Object.keys(generatedFiles).length : 0;

  return (
    <>
      <style jsx global>{`
        [data-radix-dialog-overlay] {
          background-color: transparent !important;
        }
      `}</style>
      <Dialog open={open} onOpenChange={setOpen} modal={false}>
        <DialogContent 
          ref={dialogRef}
          className="max-w-3xl h-[80vh] flex flex-col p-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'default',
          }}
          onMouseDown={handleMouseDown}
        >
          <DialogHeader 
            className="px-6 pt-6 pb-4 border-b cursor-grab active:cursor-grabbing select-none"
            data-drag-handle
          >
            <DialogTitle>AI Code Generator</DialogTitle>
            <DialogDescription>
              Describe what you want to build and let AI generate the code for you. (Press Ctrl+. to open)
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-3 p-6 min-h-0">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Zap className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No chat history yet.</p>
                  <p className="text-xs text-muted-foreground/70">Start by entering a prompt below.</p>
                </div>
              ) : (
                <>
                  {chatHistory.map((message) => (
                    <div key={message.id} className="space-y-2">
                      {/* User Prompt */}
                      {message.type === "prompt" && (
                        <div className="flex justify-end">
                          <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm max-w-[80%]">
                            {message.content}
                          </div>
                        </div>
                      )}

                      {/* AI Response */}
                      {message.type === "response" && (
                        <div className="flex justify-start">
                          <div className="space-y-2 max-w-[80%]">
                            {message.error ? (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-destructive">{message.error}</p>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-foreground">{message.content}</p>
                                </div>
                                {message.files && Object.keys(message.files).length > 0 && (
                                  <div className="ml-6 space-y-1">
                                    {Object.keys(message.files).map((filePath) => (
                                      <div key={filePath} className="flex items-center gap-2">
                                        <FileCode className="w-3 h-3 text-green-600" />
                                        <span className="text-xs text-muted-foreground font-mono">{filePath}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={historyEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="relative border-t border-border bg-background p-6 space-y-3 shrink-0">
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="What do you want to build?"
                  className="w-full h-20 px-3 py-2 text-sm rounded-md bg-background border border-input text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      handleGenerate();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">Ctrl+Enter to generate</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>

                {chatHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearHistory}
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}