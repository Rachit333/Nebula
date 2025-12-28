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

// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import { useAICodeGeneration } from "@/hooks/useAICodeGeneration";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Loader2, Zap, AlertCircle, CheckCircle, FileCode, Trash2, Send } from "lucide-react";

// interface AICodeGeneratorProps {
//   onSuccess?: () => void;
//   trigger?: React.ReactNode;
// }

// export default function AICodeGenerator({
//   onSuccess,
//   trigger,
// }: AICodeGeneratorProps) {
//   const [open, setOpen] = useState(false);
//   const [prompt, setPrompt] = useState("");
//   const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const { isLoading, error, generatedFiles, chatHistory, generateCode, clearHistory } = useAICodeGeneration();
//   const historyEndRef = useRef<HTMLDivElement>(null);
//   const dialogRef = useRef<HTMLDivElement>(null);

//   // Listen for Ctrl+. to open dialog
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && e.key === ".") {
//         e.preventDefault();
//         setOpen(true);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   // Handle dragging
//   useEffect(() => {
//     if (!isDragging) return;

//     const handleMouseMove = (e: MouseEvent) => {
//       const deltaX = e.clientX - dragStart.x;
//       const deltaY = e.clientY - dragStart.y;
//       setPosition({ x: position.x + deltaX, y: position.y + deltaY });
//       setDragStart({ x: e.clientX, y: e.clientY });
//     };

//     const handleMouseUp = () => {
//       setIsDragging(false);
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseup", handleMouseUp);

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [isDragging, dragStart, position]);

//   const handleMouseDown = (e: React.MouseEvent) => {
//     // Only start dragging if clicking on the header
//     if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
//       setIsDragging(true);
//       setDragStart({ x: e.clientX, y: e.clientY });
//     }
//   };

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

//   const handleSubmitClarification = async (questionCount: number) => {
//     const answers = Object.entries(clarificationAnswers)
//       .map(([key, ans]) => `${key}: ${ans}`)
//       .join("\n");

//     if (answers.trim()) {
//       await generateCode({
//         prompt: answers,
//       });
//       setClarificationAnswers({});
//     }
//   };

//   const fileCount = generatedFiles ? Object.keys(generatedFiles).length : 0;

//   return (
//     <>
//       <style jsx global>{`
//         [data-radix-dialog-overlay] {
//           background-color: transparent !important;
//         }
//       `}</style>
//       <Dialog open={open} onOpenChange={setOpen} modal={false}>
//         <DialogContent
//           ref={dialogRef}
//           className="max-w-3xl h-[80vh] flex flex-col p-0"
//           style={{
//             transform: `translate(${position.x}px, ${position.y}px)`,
//             cursor: isDragging ? 'grabbing' : 'default',
//           }}
//           onMouseDown={handleMouseDown}
//         >
//           <DialogHeader
//             className="px-6 pt-6 pb-4 border-b cursor-grab active:cursor-grabbing select-none"
//             data-drag-handle
//           >
//             <DialogTitle>AI Code Generator</DialogTitle>
//             <DialogDescription>
//               Describe what you want to build and let AI generate the code for you. (Press Ctrl+. to open)
//             </DialogDescription>
//           </DialogHeader>

//           <div className="flex-1 flex flex-col min-h-0">
//             {/* Chat History */}
//             <div className="flex-1 overflow-y-auto space-y-3 p-6 min-h-0">
//               {chatHistory.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-center">
//                   <Zap className="w-8 h-8 text-muted-foreground/50 mb-2" />
//                   <p className="text-sm text-muted-foreground">No chat history yet.</p>
//                   <p className="text-xs text-muted-foreground/70">Start by entering a prompt below.</p>
//                 </div>
//               ) : (
//                 <>
//                   {chatHistory.map((message) => (
//                     <div key={message.id} className="space-y-2">
//                       {/* User Prompt */}
//                       {message.type === "prompt" && (
//                         <div className="flex justify-end">
//                           <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm max-w-[80%]">
//                             {message.content}
//                           </div>
//                         </div>
//                       )}

//                       {/* AI Response with Code */}
//                       {message.type === "response" && (
//                         <div className="flex justify-start">
//                           <div className="space-y-2 max-w-[80%]">
//                             {message.error ? (
//                               <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
//                                 <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
//                                 <p className="text-xs text-destructive">{message.error}</p>
//                               </div>
//                             ) : (
//                               <>
//                                 <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
//                                   <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                                   <p className="text-xs text-foreground">{message.content}</p>
//                                 </div>
//                                 {message.files && Object.keys(message.files).length > 0 && (
//                                   <div className="ml-6 space-y-1">
//                                     {Object.keys(message.files).map((filePath) => (
//                                       <div key={filePath} className="flex items-center gap-2">
//                                         <FileCode className="w-3 h-3 text-green-600" />
//                                         <span className="text-xs text-muted-foreground font-mono">{filePath}</span>
//                                         {message.mergeStrategy?.[filePath] === "append" && (
//                                           <span className="text-xs text-blue-600 font-medium">(appended)</span>
//                                         )}
//                                       </div>
//                                     ))}
//                                   </div>
//                                 )}
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       )}

//                       {/* Clarification Question */}
//                       {message.type === "clarification" && (
//                         <div className="flex justify-start w-full">
//                           <div className="space-y-4 max-w-[95%] w-full">
//                             {/* Chat Message Box */}
//                             {message.content && (
//                               <div className="bg-blue-500/15 border border-blue-500/40 rounded-xl p-5 backdrop-blur-sm">
//                                 <div className="flex items-start gap-3">
//                                   <div className="p-2 rounded-lg bg-blue-500/20">
//                                     <AlertCircle className="w-5 h-5 text-blue-600" />
//                                   </div>
//                                   <div className="flex-1">
//                                     <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
//                                       {message.content}
//                                     </p>
//                                   </div>
//                                 </div>
//                               </div>
//                             )}

//                             {/* Questions with input fields */}
//                             {message.questions && message.questions.length > 0 ? (
//                               <div className="space-y-4 pl-2">
//                                 {message.questions.map((question, idx) => (
//                                   <div key={question.id} className="space-y-2">
//                                     <label className="block">
//                                       <p className="text-sm font-medium text-foreground mb-2">
//                                         <span className="text-blue-600 font-bold">{idx + 1}.</span> {question.label}
//                                         {question.required && <span className="text-red-500 ml-1">*</span>}
//                                       </p>

//                                       {/* Single Select */}
//                                       {question.type === "single-select" && (
//                                         <select
//                                           value={clarificationAnswers[question.id] || ""}
//                                           onChange={(e) =>
//                                             setClarificationAnswers({
//                                               ...clarificationAnswers,
//                                               [question.id]: e.target.value,
//                                             })
//                                           }
//                                           className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-foreground focus:outline-none"
//                                         >
//                                           <option value="">Select an option...</option>
//                                           {question.options?.map((opt) => (
//                                             <option key={opt} value={opt}>
//                                               {opt}
//                                             </option>
//                                           ))}
//                                         </select>
//                                       )}

//                                       {/* Multi Select */}
//                                       {question.type === "multi-select" && (
//                                         <div className="space-y-2">
//                                           {question.options?.map((opt) => (
//                                             <label key={opt} className="flex items-center gap-2 cursor-pointer">
//                                               <input
//                                                 type="checkbox"
//                                                 value={opt}
//                                                 checked={(clarificationAnswers[question.id] || "").split(",").includes(opt)}
//                                                 onChange={(e) => {
//                                                   const current = (clarificationAnswers[question.id] || "").split(",").filter(Boolean);
//                                                   if (e.target.checked) {
//                                                     current.push(opt);
//                                                   } else {
//                                                     const idx = current.indexOf(opt);
//                                                     if (idx > -1) current.splice(idx, 1);
//                                                   }
//                                                   setClarificationAnswers({
//                                                     ...clarificationAnswers,
//                                                     [question.id]: current.join(","),
//                                                   });
//                                                 }}
//                                                 className="w-4 h-4 rounded accent-blue-600"
//                                               />
//                                               <span className="text-sm text-foreground">{opt}</span>
//                                             </label>
//                                           ))}
//                                         </div>
//                                       )}

//                                       {/* Text Input */}
//                                       {question.type === "text" && (
//                                         <input
//                                           type="text"
//                                           value={clarificationAnswers[question.id] || ""}
//                                           onChange={(e) =>
//                                             setClarificationAnswers({
//                                               ...clarificationAnswers,
//                                               [question.id]: e.target.value,
//                                             })
//                                           }
//                                           placeholder={question.placeholder || "Enter your answer..."}
//                                           className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-foreground focus:outline-none"
//                                         />
//                                       )}

//                                       {/* Textarea */}
//                                       {question.type === "textarea" && (
//                                         <textarea
//                                           value={clarificationAnswers[question.id] || ""}
//                                           onChange={(e) =>
//                                             setClarificationAnswers({
//                                               ...clarificationAnswers,
//                                               [question.id]: e.target.value,
//                                             })
//                                           }
//                                           placeholder={question.placeholder || "Enter your answer..."}
//                                           className="w-full min-h-20 px-3 py-2 text-sm rounded-lg bg-background border border-input focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-foreground resize-none focus:outline-none"
//                                         />
//                                       )}
//                                     </label>
//                                   </div>
//                                 ))}

//                                 {/* Submit button */}
//                                 <button
//                                   onClick={() => handleSubmitClarification(message.questions!.length)}
//                                   disabled={
//                                     isLoading ||
//                                     message.questions!.some(
//                                       (q) => q.required && !clarificationAnswers[q.id]?.trim()
//                                     )
//                                   }
//                                   className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                 >
//                                   <Send className="w-4 h-4" />
//                                   {isLoading ? "Processing..." : "Submit Answers"}
//                                 </button>
//                               </div>
//                             ) : null}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                   <div ref={historyEndRef} />
//                 </>
//               )}
//             </div>

//             {/* Input Area */}
//             <div className="relative border-t border-border bg-background p-6 space-y-3 shrink-0">
//               <div>
//                 <textarea
//                   value={prompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                   placeholder="What do you want to build?"
//                   className="w-full h-20 px-3 py-2 text-sm rounded-md bg-background border border-input text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
//                   disabled={isLoading}
//                   onKeyDown={(e) => {
//                     if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
//                       handleGenerate();
//                     }
//                   }}
//                 />
//                 <p className="text-xs text-muted-foreground mt-1">Ctrl+Enter to generate</p>
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   onClick={handleGenerate}
//                   disabled={isLoading || !prompt.trim()}
//                   className="flex-1"
//                 >
//                   {isLoading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Generating...
//                     </>
//                   ) : (
//                     <>
//                       <Zap className="w-4 h-4 mr-2" />
//                       Generate
//                     </>
//                   )}
//                 </Button>

//                 {chatHistory.length > 0 && (
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={clearHistory}
//                     title="Clear history"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// -----------------------------------------------

// "use client"
// import type React from "react"
// import { useState, useRef, useEffect } from "react"
// import { useAICodeGeneration } from "@/hooks/useAICodeGeneration"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import {
//   Loader2,
//   Sparkles,
//   AlertCircle,
//   CheckCircle2,
//   FileCode2,
//   Trash2,
//   Send,
//   Command,
//   GripHorizontal,
//   Bot,
//   User,
//   MessageSquarePlus,
// } from "lucide-react"
// import { cn } from "@/lib/utils"

// interface AICodeGeneratorProps {
//   onSuccess?: () => void
//   trigger?: React.ReactNode
// }

// export default function AICodeGenerator({ onSuccess, trigger }: AICodeGeneratorProps) {
//   const [open, setOpen] = useState(false)
//   const [prompt, setPrompt] = useState("")
//   const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({})
//   const [position, setPosition] = useState({ x: 0, y: 0 })
//   const [isDragging, setIsDragging] = useState(false)
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
//   const { isLoading, error, generatedFiles, chatHistory, generateCode, clearHistory } = useAICodeGeneration()
//   const historyEndRef = useRef<HTMLDivElement>(null)
//   const dialogRef = useRef<HTMLDivElement>(null)
//   const textareaRef = useRef<HTMLTextAreaElement>(null)

//   // Listen for Ctrl+. to open dialog
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && e.key === ".") {
//         e.preventDefault()
//         setOpen(true)
//       }
//     }

//     window.addEventListener("keydown", handleKeyDown)
//     return () => window.removeEventListener("keydown", handleKeyDown)
//   }, [])

//   // Focus textarea when dialog opens
//   useEffect(() => {
//     if (open && textareaRef.current) {
//       setTimeout(() => textareaRef.current?.focus(), 100)
//     }
//   }, [open])

//   // Handle dragging
//   useEffect(() => {
//     if (!isDragging) return

//     const handleMouseMove = (e: MouseEvent) => {
//       const deltaX = e.clientX - dragStart.x
//       const deltaY = e.clientY - dragStart.y
//       setPosition({ x: position.x + deltaX, y: position.y + deltaY })
//       setDragStart({ x: e.clientX, y: e.clientY })
//     }

//     const handleMouseUp = () => {
//       setIsDragging(false)
//     }

//     window.addEventListener("mousemove", handleMouseMove)
//     window.addEventListener("mouseup", handleMouseUp)

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove)
//       window.removeEventListener("mouseup", handleMouseUp)
//     }
//   }, [isDragging, dragStart, position])

//   const handleMouseDown = (e: React.MouseEvent) => {
//     if ((e.target as HTMLElement).closest("[data-drag-handle]")) {
//       setIsDragging(true)
//       setDragStart({ x: e.clientX, y: e.clientY })
//     }
//   }

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     historyEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [chatHistory])

//   const handleGenerate = async () => {
//     if (prompt.trim()) {
//       await generateCode({
//         prompt,
//       })
//       setPrompt("")
//     }
//   }

//   const handleSubmitClarification = async (questionCount: number) => {
//     const answers = Object.entries(clarificationAnswers)
//       .map(([key, ans]) => `${key}: ${ans}`)
//       .join("\n")

//     if (answers.trim()) {
//       await generateCode({
//         prompt: answers,
//       })
//       setClarificationAnswers({})
//     }
//   }

//   const fileCount = generatedFiles ? Object.keys(generatedFiles).length : 0

//   return (
//     <>
//       <style jsx global>{`
//         [data-radix-dialog-overlay] {
//           background-color: rgba(0, 0, 0, 0.4) !important;
//           backdrop-filter: blur(4px);
//         }
//       `}</style>
//       <Dialog open={open} onOpenChange={setOpen} modal={false}>
//         <DialogContent
//           ref={dialogRef}
//           className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 rounded-2xl border border-border/50 shadow-2xl overflow-hidden bg-background/95 backdrop-blur-xl"
//           style={{
//             transform: `translate(${position.x}px, ${position.y}px)`,
//             cursor: isDragging ? "grabbing" : "default",
//           }}
//           onMouseDown={handleMouseDown}
//         >
//           {/* Header */}
//           <DialogHeader
//             className="px-5 py-4 border-b border-border/50 cursor-grab active:cursor-grabbing select-none bg-muted/30"
//             data-drag-handle
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="relative">
//                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
//                     <Sparkles className="w-5 h-5 text-primary-foreground" />
//                   </div>
//                   <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
//                 </div>
//                 <div>
//                   <DialogTitle className="text-base font-semibold">AI Code Generator</DialogTitle>
//                   <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
//                     <Command className="w-3 h-3" />
//                     <span>+ .</span>
//                     <span className="text-muted-foreground/60">to toggle</span>
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <GripHorizontal className="w-5 h-5 text-muted-foreground/40" />
//               </div>
//             </div>
//           </DialogHeader>

//           <div className="flex-1 flex flex-col min-h-0">
//             {/* Chat History */}
//             <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
//               {chatHistory.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full text-center px-8">
//                   <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
//                     <MessageSquarePlus className="w-8 h-8 text-muted-foreground/50" />
//                   </div>
//                   <h3 className="text-sm font-medium text-foreground mb-1">Start a conversation</h3>
//                   <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
//                     Describe what you want to build and I'll generate the code for you.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {chatHistory.map((message) => (
//                     <div key={message.id} className="space-y-4">
//                       {/* User Prompt */}
//                       {message.type === "prompt" && (
//                         <div className="flex gap-3 justify-end">
//                           <div className="max-w-[85%] flex flex-col items-end gap-2">
//                             <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed shadow-sm">
//                               {message.content}
//                             </div>
//                           </div>
//                           <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
//                             <User className="w-4 h-4 text-secondary-foreground" />
//                           </div>
//                         </div>
//                       )}

//                       {/* AI Response with Code */}
//                       {message.type === "response" && (
//                         <div className="flex gap-3">
//                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-sm">
//                             <Bot className="w-4 h-4 text-primary-foreground" />
//                           </div>
//                           <div className="max-w-[85%] space-y-2">
//                             {message.error ? (
//                               <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
//                                 <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
//                                 <p className="text-sm text-destructive">{message.error}</p>
//                               </div>
//                             ) : (
//                               <>
//                                 <div className="bg-muted/60 px-4 py-2.5 rounded-2xl rounded-bl-md border border-border/50">
//                                   <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
//                                 </div>
//                                 {message.files && Object.keys(message.files).length > 0 && (
//                                   <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
//                                     <div className="flex items-center gap-2 mb-2">
//                                       <CheckCircle2 className="w-4 h-4 text-emerald-600" />
//                                       <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
//                                         {Object.keys(message.files).length} file
//                                         {Object.keys(message.files).length !== 1 ? "s" : ""} generated
//                                       </span>
//                                     </div>
//                                     {Object.keys(message.files).map((filePath) => (
//                                       <div
//                                         key={filePath}
//                                         className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
//                                       >
//                                         <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
//                                         <span className="text-xs text-foreground font-mono truncate">{filePath}</span>
//                                         {message.mergeStrategy?.[filePath] === "append" && (
//                                           <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 font-medium">
//                                             appended
//                                           </span>
//                                         )}
//                                       </div>
//                                     ))}
//                                   </div>
//                                 )}
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       )}

//                       {/* Clarification Question */}
//                       {message.type === "clarification" && (
//                         <div className="flex gap-3">
//                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
//                             <AlertCircle className="w-4 h-4 text-white" />
//                           </div>
//                           <div className="flex-1 max-w-[90%] space-y-3">
//                             {message.content && (
//                               <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
//                                 <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
//                                   {message.content}
//                                 </p>
//                               </div>
//                             )}

//                             {message.questions && message.questions.length > 0 && (
//                               <div className="space-y-4 bg-muted/40 rounded-xl p-4 border border-border/50">
//                                 {message.questions.map((question, idx) => (
//                                   <div key={question.id} className="space-y-2">
//                                     <label className="block">
//                                       <p className="text-sm font-medium text-foreground mb-2 flex items-start gap-2">
//                                         <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
//                                           {idx + 1}
//                                         </span>
//                                         <span className="flex-1">
//                                           {question.label}
//                                           {question.required && <span className="text-red-500 ml-1">*</span>}
//                                         </span>
//                                       </p>

//                                       {question.type === "single-select" && (
//                                         <select
//                                           value={clarificationAnswers[question.id] || ""}
//                                           onChange={(e) =>
//                                             setClarificationAnswers({
//                                               ...clarificationAnswers,
//                                               [question.id]: e.target.value,
//                                             })
//                                           }
//                                           className="w-full px-3 py-2.5 text-sm rounded-xl bg-background border border-input hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground transition-all outline-none"
//                                         >
//                                           <option value="">Select an option...</option>
//                                           {question.options?.map((opt) => (
//                                             <option key={opt} value={opt}>
//                                               {opt}
//                                             </option>
//                                           ))}
//                                         </select>
//                                       )}

//                                       {question.type === "multi-select" && (
//                                         <div className="grid grid-cols-2 gap-2">
//                                           {question.options?.map((opt) => (
//                                             <label
//                                               key={opt}
//                                               className={cn(
//                                                 "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
//                                                 (clarificationAnswers[question.id] || "").split(",").includes(opt)
//                                                   ? "bg-primary/10 border-primary/30 text-foreground"
//                                                   : "bg-background border-input hover:border-ring/50",
//                                               )}
//                                             >
//                                               <input
//                                                 type="checkbox"
//                                                 value={opt}
//                                                 checked={(clarificationAnswers[question.id] || "")
//                                                   .split(",")
//                                                   .includes(opt)}
//                                                 onChange={(e) => {
//                                                   const current = (clarificationAnswers[question.id] || "")
//                                                     .split(",")
//                                                     .filter(Boolean)
//                                                   if (e.target.checked) {
//                                                     current.push(opt)
//                                                   } else {
//                                                     const idx = current.indexOf(opt)
//                                                     if (idx > -1) current.splice(idx, 1)
//                                                   }
//                                                   setClarificationAnswers({
//                                                     ...clarificationAnswers,
//                                                     [question.id]: current.join(","),
//                                                   })
//                                                 }}
//                                                 className="w-4 h-4 rounded accent-primary"
//                                               />
//                                               <span className="text-sm">{opt}</span>
//                                             </label>
//                                           ))}
//                                         </div>
//                                       )}

//                                       {question.type === "text" && (
//                                         <input
//                                           type="text"
//                                           value={clarificationAnswers[question.id] || ""}
//                                           onChange={(e) =>
//                                             setClarificationAnswers({
//                                               ...clarificationAnswers,
//                                               [question.id]: e.target.value,
//                                             })
//                                           }
//                                           placeholder={question.placeholder || "Enter your answer..."}
//                                           className="w-full px-3 py-2.5 text-sm rounded-xl bg-background border border-input hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground transition-all outline-none placeholder:text-muted-foreground"
//                                         />
//                                       )}

//                                       {question.type === "textarea" && (
//                                         <textarea
//                                           value={clarificationAnswers[question.id] || ""}
//                                           onChange={(e) =>
//                                             setClarificationAnswers({
//                                               ...clarificationAnswers,
//                                               [question.id]: e.target.value,
//                                             })
//                                           }
//                                           placeholder={question.placeholder || "Enter your answer..."}
//                                           className="w-full min-h-[80px] px-3 py-2.5 text-sm rounded-xl bg-background border border-input hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground resize-none transition-all outline-none placeholder:text-muted-foreground"
//                                         />
//                                       )}
//                                     </label>
//                                   </div>
//                                 ))}

//                                 <Button
//                                   onClick={() => handleSubmitClarification(message.questions!.length)}
//                                   disabled={
//                                     isLoading ||
//                                     message.questions!.some((q) => q.required && !clarificationAnswers[q.id]?.trim())
//                                   }
//                                   className="w-full mt-2 rounded-xl h-10"
//                                 >
//                                   <Send className="w-4 h-4 mr-2" />
//                                   {isLoading ? "Processing..." : "Submit Answers"}
//                                 </Button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                   <div ref={historyEndRef} />
//                 </div>
//               )}
//             </div>

//             {/* Input Area */}
//             <div className="border-t border-border/50 bg-muted/20 p-4 space-y-3 shrink-0">
//               <div className="relative">
//                 <textarea
//                   ref={textareaRef}
//                   value={prompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                   placeholder="Describe what you want to build..."
//                   className="w-full min-h-[100px] px-4 py-3 text-sm rounded-xl bg-background border border-input hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground resize-none transition-all outline-none placeholder:text-muted-foreground pr-24"
//                   disabled={isLoading}
//                   onKeyDown={(e) => {
//                     if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
//                       handleGenerate()
//                     }
//                   }}
//                 />
//                 <div className="absolute bottom-3 right-3 flex items-center gap-2">
//                   <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
//                     <Command className="w-3 h-3" />
//                     <span>↵</span>
//                   </kbd>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   onClick={handleGenerate}
//                   disabled={isLoading || !prompt.trim()}
//                   className="flex-1 h-11 rounded-xl font-medium shadow-sm"
//                   size="lg"
//                 >
//                   {isLoading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Generating...
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="w-4 h-4 mr-2" />
//                       Generate Code
//                     </>
//                   )}
//                 </Button>

//                 {chatHistory.length > 0 && (
//                   <Button
//                     variant="outline"
//                     size="lg"
//                     onClick={clearHistory}
//                     title="Clear conversation"
//                     className="h-11 px-4 rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors bg-transparent"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// -----------------------------------------------

"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useAICodeGeneration } from "@/hooks/useAICodeGeneration"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCode2,
  Trash2,
  Send,
  Command,
  GripHorizontal,
  Bot,
  User,
  MessageSquarePlus,
  ListTodo,
  Circle,
  CheckCircle,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Todo {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  tags: string[]
  completed: boolean
}

interface ClarificationQuestion {
  id: string
  label: string
  type: "text" | "textarea" | "single-select" | "multi-select"
  required?: boolean
  placeholder?: string
  options?: string[]
}

interface ChatMessage {
  id: string
  type: "prompt" | "response" | "clarification"
  content: string
  error?: string
  files?: Record<string, string>
  mergeStrategy?: Record<string, string>
  todos?: Todo[]
  questions?: ClarificationQuestion[]
}

interface AICodeGeneratorProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export default function AICodeGenerator({}: AICodeGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({})
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const { isLoading, chatHistory, generateCode, clearHistory } = useAICodeGeneration()
  const historyEndRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Listen for Ctrl+. to open dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus textarea when dialog opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setPosition({ x: position.x + deltaX, y: position.y + deltaY })
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart, position])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-drag-handle]")) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const toggleMessageExpanded = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  const handleGenerate = async () => {
    if (prompt.trim()) {
      await generateCode({
        prompt,
      })
      setPrompt("")
    }
  }

  const handleSubmitClarification = async () => {
    const answers = Object.entries(clarificationAnswers)
      .map(([key, ans]) => `${key}: ${ans}`)
      .join("\n")

    if (answers.trim()) {
      await generateCode({
        prompt: answers,
      })
      setClarificationAnswers({})
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-500/10 border-red-500/20"
      case "medium":
        return "text-amber-600 bg-amber-500/10 border-amber-500/20"
      case "low":
        return "text-blue-600 bg-blue-500/10 border-blue-500/20"
      default:
        return "text-muted-foreground bg-muted/10 border-border/20"
    }
  }

  return (
    <>
      <style jsx global>{`
        [data-radix-dialog-overlay] {
          background-color: rgba(0, 0, 0, 0.4) !important;
        }
      `}</style>
      <Dialog open={open} onOpenChange={setOpen} modal={false}>
        <DialogContent
          ref={dialogRef}
          className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 rounded-2xl border border-border/50 shadow-2xl overflow-hidden bg-background/95"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? "grabbing" : "default",
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header */}
          <DialogHeader
            className="px-5 py-4 border-b border-border/50 cursor-grab active:cursor-grabbing select-none bg-muted/30"
            data-drag-handle
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold">AI Code Generator</DialogTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Command className="w-3 h-3" />
                    <span>+ .</span>
                    <span className="text-muted-foreground/60">to toggle</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-5 h-5 text-muted-foreground/40" />
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <MessageSquarePlus className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">Start a conversation</h3>
                  <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                    Describe what you want to build and I'll generate the code for you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((message) => (
                    <div key={message.id} className="space-y-4">
                      {/* User Prompt */}
                      {message.type === "prompt" && (
                        <div className="flex gap-3 justify-end">
                          <div className="max-w-[85%] flex flex-col items-end gap-2">
                            <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed shadow-sm">
                              {message.content}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-secondary-foreground" />
                          </div>
                        </div>
                      )}

                      {/* AI Response with Code */}
                      {message.type === "response" && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <div className="max-w-[85%] space-y-3">
                            {message.error ? (
                              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-destructive">{message.error}</p>
                              </div>
                            ) : (
                              <>
                                {message.content && (
                                  <div className="bg-muted/60 px-4 py-2.5 rounded-2xl rounded-bl-md border border-border/50">
                                    <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
                                  </div>
                                )}

                                {message.files && Object.keys(message.files).length > 0 && (
                                  <Collapsible
                                    open={expandedMessages.has(message.id)}
                                    onOpenChange={() => toggleMessageExpanded(message.id)}
                                  >
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl overflow-hidden">
                                      <CollapsibleTrigger asChild>
                                        <button className="w-full flex items-center justify-between p-3 hover:bg-emerald-500/5 transition-colors">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                              {Object.keys(message.files).length} file
                                              {Object.keys(message.files).length !== 1 ? "s" : ""} generated
                                            </span>
                                          </div>
                                          <ChevronDown
                                            className="w-4 h-4 text-emerald-600 transition-transform"
                                            style={{
                                              transform: expandedMessages.has(message.id)
                                                ? "rotate(0deg)"
                                                : "rotate(-90deg)",
                                            }}
                                          />
                                        </button>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <div className="space-y-1.5 p-3 pt-0 border-t border-emerald-500/10">
                                          {Object.keys(message.files).map((filePath) => (
                                            <div
                                              key={filePath}
                                              className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
                                            >
                                              <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
                                              <span className="text-xs text-foreground font-mono truncate">
                                                {filePath}
                                              </span>
                                              {message.mergeStrategy?.[filePath] === "append" && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 font-medium whitespace-nowrap">
                                                  appended
                                                </span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                )}

                                {message.todos && message.todos.length > 0 && (
                                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <ListTodo className="w-4 h-4 text-purple-600" />
                                      <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                                        {message.todos.length} recommended task
                                        {message.todos.length !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {message.todos.map((todo) => (
                                        <div
                                          key={todo.id}
                                          className="bg-background/50 rounded-lg p-3 border border-border/30 space-y-2"
                                        >
                                          <div className="flex items-start gap-2">
                                            {todo.completed ? (
                                              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            ) : (
                                              <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h4 className="text-sm font-medium text-foreground">{todo.title}</h4>
                                                <span
                                                  className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide",
                                                    getPriorityColor(todo.priority),
                                                  )}
                                                >
                                                  {todo.priority}
                                                </span>
                                              </div>
                                              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                                                {todo.description}
                                              </p>
                                              {(todo.tags ?? []).length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                  {(todo.tags ?? []).map((tag, idx) => (
                                                    <span
                                                      key={idx}
                                                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                                    >
                                                      {tag}
                                                    </span>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Clarification Question */}
                      {message.type === "clarification" && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 max-w-[90%] space-y-3">
                            {message.content && (
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                  {message.content}
                                </p>
                              </div>
                            )}

                            {message.questions && message.questions.length > 0 && (
                              <div className="space-y-4 bg-muted/40 rounded-xl p-4 border border-border/50">
                                {message.questions.map((question, idx) => (
                                  <div key={question.id} className="space-y-2">
                                    <label className="block">
                                      <p className="text-sm font-medium text-foreground mb-2 flex items-start gap-2">
                                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                          {idx + 1}
                                        </span>
                                        <span className="flex-1">
                                          {question.label}
                                          {question.required && <span className="text-red-500 ml-1">*</span>}
                                        </span>
                                      </p>

                                      {question.type === "single-select" && (
                                        <select
                                          value={clarificationAnswers[question.id] || ""}
                                          onChange={(e) =>
                                            setClarificationAnswers({
                                              ...clarificationAnswers,
                                              [question.id]: e.target.value,
                                            })
                                          }
                                          className="w-full px-3 py-2.5 text-sm rounded-xl bg-background border border-input hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground transition-all outline-none"
                                        >
                                          <option value="">Select an option...</option>
                                          {question.options?.map((opt) => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      )}

                                      {question.type === "multi-select" && (
                                        <div className="grid grid-cols-2 gap-2">
                                          {question.options?.map((opt) => (
                                            <label
                                              key={opt}
                                              className={cn(
                                                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
                                                (clarificationAnswers[question.id] || "").split(",").includes(opt)
                                                  ? "bg-primary/10 border-primary/30 text-foreground"
                                                  : "bg-background border-input hover:border-ring/50",
                                              )}
                                            >
                                              <input
                                                type="checkbox"
                                                value={opt}
                                                checked={(clarificationAnswers[question.id] || "")
                                                  .split(",")
                                                  .includes(opt)}
                                                onChange={(e) => {
                                                  const current = (clarificationAnswers[question.id] || "")
                                                    .split(",")
                                                    .filter(Boolean)
                                                  if (e.target.checked) {
                                                    current.push(opt)
                                                  } else {
                                                    const idx = current.indexOf(opt)
                                                    if (idx > -1) current.splice(idx, 1)
                                                  }
                                                  setClarificationAnswers({
                                                    ...clarificationAnswers,
                                                    [question.id]: current.join(","),
                                                  })
                                                }}
                                                className="w-4 h-4 rounded accent-primary"
                                              />
                                              <span className="text-sm">{opt}</span>
                                            </label>
                                          ))}
                                        </div>
                                      )}

                                      {question.type === "text" && (
                                        <input
                                          type="text"
                                          value={clarificationAnswers[question.id] || ""}
                                          onChange={(e) =>
                                            setClarificationAnswers({
                                              ...clarificationAnswers,
                                              [question.id]: e.target.value,
                                            })
                                          }
                                          placeholder={question.placeholder || "Enter your answer..."}
                                          className="w-full px-3 py-2.5 text-sm rounded-xl bg-background border border-input hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground transition-all outline-none placeholder:text-muted-foreground"
                                        />
                                      )}

                                      {question.type === "textarea" && (
                                        <textarea
                                          value={clarificationAnswers[question.id] || ""}
                                          onChange={(e) =>
                                            setClarificationAnswers({
                                              ...clarificationAnswers,
                                              [question.id]: e.target.value,
                                            })
                                          }
                                          placeholder={question.placeholder || "Enter your answer..."}
                                          className="w-full min-h-[80px] px-3 py-2.5 text-sm rounded-xl bg-background border border-input hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground resize-none transition-all outline-none placeholder:text-muted-foreground"
                                        />
                                      )}
                                    </label>
                                  </div>
                                ))}

                                <Button
                                  onClick={() => handleSubmitClarification()}
                                  disabled={
                                    isLoading ||
                                    message.questions!.some((q) => q.required && !clarificationAnswers[q.id]?.trim())
                                  }
                                  className="w-full mt-2 rounded-xl h-10"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {isLoading ? "Processing..." : "Submit Answers"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={historyEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 bg-muted/20 p-4 space-y-3 shrink-0">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to build..."
                  className="w-full min-h-[100px] px-4 py-3 text-sm rounded-xl bg-background border border-input hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20 text-foreground resize-none transition-all outline-none placeholder:text-muted-foreground pr-24"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      handleGenerate()
                    }
                  }}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <Command className="w-3 h-3" />
                    <span>↵</span>
                  </kbd>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="flex-1 h-11 rounded-xl font-medium shadow-sm"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Code
                    </>
                  )}
                </Button>

                {chatHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={clearHistory}
                    title="Clear conversation"
                    className="h-11 px-4 rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors bg-transparent"
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
  )
}
