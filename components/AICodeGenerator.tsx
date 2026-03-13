// "use client"
// import type React from "react"
// import { useState, useRef, useEffect } from "react"
// import { useAICodeGeneration } from "@/hooks/useAICodeGeneration"
// import { Button } from "@/components/ui/button"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
//   ListTodo,
//   Circle,
//   CheckCircle,
//   ChevronDown,
// } from "lucide-react"
// import { cn } from "@/lib/utils"

// interface Todo {
//   id: string
//   title: string
//   description: string
//   priority: "high" | "medium" | "low"
//   tags: string[]
//   completed: boolean
// }

// interface ClarificationQuestion {
//   id: string
//   label: string
//   type: "text" | "textarea" | "single-select" | "multi-select"
//   required?: boolean
//   placeholder?: string
//   options?: string[]
// }

// interface ChatMessage {
//   id: string
//   type: "prompt" | "response" | "clarification"
//   content: string
//   error?: string
//   files?: Record<string, string>
//   mergeStrategy?: Record<string, string>
//   todos?: Todo[]
//   questions?: ClarificationQuestion[]
// }

// interface AICodeGeneratorProps {
//   onSuccess?: () => void
//   trigger?: React.ReactNode
// }

// export default function AICodeGenerator({}: AICodeGeneratorProps) {
//   const [open, setOpen] = useState(false)
//   const [prompt, setPrompt] = useState("")
//   const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({})
//   const [position, setPosition] = useState({ x: 0, y: 0 })
//   const [isDragging, setIsDragging] = useState(false)
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
//   const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
//   const { isLoading, chatHistory, generateCode, clearHistory } = useAICodeGeneration()
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

//   const toggleMessageExpanded = (messageId: string) => {
//     setExpandedMessages((prev) => {
//       const newSet = new Set(prev)
//       if (newSet.has(messageId)) {
//         newSet.delete(messageId)
//       } else {
//         newSet.add(messageId)
//       }
//       return newSet
//     })
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

//   const handleSubmitClarification = async () => {
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

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "high":
//         return "text-red-600 bg-red-500/10 border-red-500/20"
//       case "medium":
//         return "text-amber-600 bg-amber-500/10 border-amber-500/20"
//       case "low":
//         return "text-blue-600 bg-blue-500/10 border-blue-500/20"
//       default:
//         return "text-muted-foreground bg-muted/10 border-border/20"
//     }
//   }

//   return (
//     <>
//       <style jsx global>{`
//         [data-radix-dialog-overlay] {
//           background-color: rgba(0, 0, 0, 0.4) !important;
//         }
//       `}</style>
//       <Dialog open={open} onOpenChange={setOpen} modal={false}>
//         <DialogContent
//           ref={dialogRef}
//           className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0 rounded-2xl border border-border/50 shadow-2xl overflow-hidden bg-background/95"
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
//                           <div className="max-w-[85%] space-y-3">
//                             {message.error ? (
//                               <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
//                                 <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
//                                 <p className="text-sm text-destructive">{message.error}</p>
//                               </div>
//                             ) : (
//                               <>
//                                 {message.content && (
//                                   <div className="bg-muted/60 px-4 py-2.5 rounded-2xl rounded-bl-md border border-border/50">
//                                     <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
//                                   </div>
//                                 )}

//                                 {message.files && Object.keys(message.files).length > 0 && (
//                                   <Collapsible
//                                     open={expandedMessages.has(message.id)}
//                                     onOpenChange={() => toggleMessageExpanded(message.id)}
//                                   >
//                                     <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl overflow-hidden">
//                                       <CollapsibleTrigger asChild>
//                                         <button className="w-full flex items-center justify-between p-3 hover:bg-emerald-500/5 transition-colors">
//                                           <div className="flex items-center gap-2">
//                                             <CheckCircle2 className="w-4 h-4 text-emerald-600" />
//                                             <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
//                                               {Object.keys(message.files).length} file
//                                               {Object.keys(message.files).length !== 1 ? "s" : ""} generated
//                                             </span>
//                                           </div>
//                                           <ChevronDown
//                                             className="w-4 h-4 text-emerald-600 transition-transform"
//                                             style={{
//                                               transform: expandedMessages.has(message.id)
//                                                 ? "rotate(0deg)"
//                                                 : "rotate(-90deg)",
//                                             }}
//                                           />
//                                         </button>
//                                       </CollapsibleTrigger>
//                                       <CollapsibleContent>
//                                         <div className="space-y-1.5 p-3 pt-0 border-t border-emerald-500/10">
//                                           {Object.keys(message.files).map((filePath) => (
//                                             <div
//                                               key={filePath}
//                                               className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
//                                             >
//                                               <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
//                                               <span className="text-xs text-foreground font-mono truncate">
//                                                 {filePath}
//                                               </span>
//                                               {message.mergeStrategy?.[filePath] === "append" && (
//                                                 <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 font-medium whitespace-nowrap">
//                                                   appended
//                                                 </span>
//                                               )}
//                                             </div>
//                                           ))}
//                                         </div>
//                                       </CollapsibleContent>
//                                     </div>
//                                   </Collapsible>
//                                 )}

//                                 {message.todos && message.todos.length > 0 && (
//                                   <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 space-y-3">
//                                     <div className="flex items-center gap-2 mb-2">
//                                       <ListTodo className="w-4 h-4 text-purple-600" />
//                                       <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
//                                         {message.todos.length} recommended task
//                                         {message.todos.length !== 1 ? "s" : ""}
//                                       </span>
//                                     </div>
//                                     <div className="space-y-2">
//                                       {message.todos.map((todo) => (
//                                         <div
//                                           key={todo.id}
//                                           className="bg-background/50 rounded-lg p-3 border border-border/30 space-y-2"
//                                         >
//                                           <div className="flex items-start gap-2">
//                                             {todo.completed ? (
//                                               <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
//                                             ) : (
//                                               <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
//                                             )}
//                                             <div className="flex-1 min-w-0">
//                                               <div className="flex items-center gap-2 flex-wrap mb-1">
//                                                 <h4 className="text-sm font-medium text-foreground">{todo.title}</h4>
//                                                 <span
//                                                   className={cn(
//                                                     "text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide",
//                                                     getPriorityColor(todo.priority),
//                                                   )}
//                                                 >
//                                                   {todo.priority}
//                                                 </span>
//                                               </div>
//                                               <p className="text-xs text-muted-foreground leading-relaxed mb-2">
//                                                 {todo.description}
//                                               </p>
//                                               {(todo.tags ?? []).length > 0 && (
//                                                 <div className="flex flex-wrap gap-1">
//                                                   {(todo.tags ?? []).map((tag, idx) => (
//                                                     <span
//                                                       key={idx}
//                                                       className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
//                                                     >
//                                                       {tag}
//                                                     </span>
//                                                   ))}
//                                                 </div>
//                                               )}
//                                             </div>
//                                           </div>
//                                         </div>
//                                       ))}
//                                     </div>
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
//                                   onClick={() => handleSubmitClarification()}
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


"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useAICodeGeneration } from "@/hooks/useAICodeGeneration"
import {
  Loader2, Sparkles, AlertCircle, CheckCircle2, FileCode2,
  Trash2, Send, Bot, User, MessageSquarePlus, ListTodo,
  Circle, CheckCircle, ChevronDown, X,
} from "lucide-react"

interface Todo {
  id: string; title: string; description: string
  priority: "high" | "medium" | "low"; tags: string[]; completed: boolean
}
interface ClarificationQuestion {
  id: string; label: string; type: "text" | "textarea" | "single-select" | "multi-select"
  required?: boolean; placeholder?: string; options?: string[]
}
interface ChatMessage {
  id: string; type: "prompt" | "response" | "clarification"
  content: string; error?: string; files?: Record<string, string>
  mergeStrategy?: Record<string, string>; todos?: Todo[]
  questions?: ClarificationQuestion[]
}

const MONO = { fontFamily: "'DM Mono', monospace" }

function getPriorityStyle(priority: string) {
  switch (priority) {
    case "high": return { color: "#f87171", background: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" }
    case "medium": return { color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" }
    case "low": return { color: "#60a5fa", background: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.25)" }
    default: return { color: "#6b7688", background: "rgba(107,118,136,0.1)", border: "rgba(107,118,136,0.25)" }
  }
}

export default function AICodeGenerator({ onClose }: { onClose?: () => void }) {
  const [prompt, setPrompt] = useState("")
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({})
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const { isLoading, chatHistory, generateCode, clearHistory } = useAICodeGeneration()
  const historyEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 80)
  }, [])

  function toggleExpanded(id: string) {
    setExpandedMessages((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  async function handleGenerate() {
    if (!prompt.trim()) return
    await generateCode({ prompt })
    setPrompt("")
  }

  async function handleSubmitClarification() {
    const answers = Object.entries(clarificationAnswers).map(([k, v]) => `${k}: ${v}`).join("\n")
    if (!answers.trim()) return
    await generateCode({ prompt: answers })
    setClarificationAnswers({})
  }

  return (
    <div className="h-full flex flex-col bg-[#080a0e] border-l border-white/7" style={MONO}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/7 flex-shrink-0">
        <div className="flex items-center gap-[10px]">
          <div className="w-7 h-7 rounded-lg bg-[rgba(200,240,75,0.12)] border border-[rgba(200,240,75,0.2)] flex items-center justify-center flex-shrink-0">
            <Sparkles size={13} className="text-[#c8f04b]" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-tight text-[#f0f2f5]" style={{ fontFamily: "'Syne', sans-serif" }}>
              AI Assistant
            </div>
            <div className="text-[9px] tracking-[0.1em] uppercase text-white/25 mt-[1px]">AI Assistant</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {chatHistory.length > 0 && (
            <button
              onClick={clearHistory}
              title="Clear conversation"
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
            >
              <Trash2 size={12} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/25 hover:text-[#f0f2f5] hover:bg-white/5 transition-all duration-150"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Chat history ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <div className="w-12 h-12 rounded-xl bg-[rgba(200,240,75,0.06)] border border-[rgba(200,240,75,0.12)] flex items-center justify-center mb-4">
              <MessageSquarePlus size={20} className="text-[#c8f04b] opacity-60" />
            </div>
            <div className="text-[13px] font-bold text-[#f0f2f5] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              Start a conversation
            </div>
            <p className="text-[11px] text-white/30 leading-relaxed max-w-[220px]">
              Describe what you want to build and I'll generate the code for you.
            </p>
          </div>
        ) : (
          chatHistory.map((message) => (
            <div key={message.id} className="space-y-3">

              {/* User prompt */}
              {message.type === "prompt" && (
                <div className="flex gap-2 justify-end">
                  <div className="max-w-[85%] bg-[rgba(200,240,75,0.09)] border border-[rgba(200,240,75,0.15)] px-3 py-2 rounded-xl rounded-br-sm text-[12px] text-[#f0f2f5] leading-relaxed">
                    {message.content}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#151820] border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={10} className="text-white/50" />
                  </div>
                </div>
              )}

              {/* AI response */}
              {message.type === "response" && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[rgba(200,240,75,0.12)] border border-[rgba(200,240,75,0.2)] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={10} className="text-[#c8f04b]" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    {message.error ? (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertCircle size={13} className="text-red-400 mt-[1px] flex-shrink-0" />
                        <p className="text-[11px] text-red-400 leading-relaxed">{message.error}</p>
                      </div>
                    ) : (
                      <>
                        {message.content && (
                          <div className="bg-[#0f1117] border border-white/7 px-3 py-2 rounded-xl rounded-bl-sm">
                            <p className="text-[12px] text-white/70 leading-relaxed">{message.content}</p>
                          </div>
                        )}

                        {message.files && Object.keys(message.files).length > 0 && (
                          <div className="bg-[rgba(200,240,75,0.06)] border border-[rgba(200,240,75,0.15)] rounded-xl overflow-hidden">
                            <button
                              onClick={() => toggleExpanded(message.id)}
                              className="w-full flex items-center justify-between p-3 hover:bg-[rgba(200,240,75,0.04)] transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-[#c8f04b]" />
                                <span className="text-[11px] font-medium text-[#c8f04b]">
                                  {Object.keys(message.files).length} file{Object.keys(message.files).length !== 1 ? "s" : ""} generated
                                </span>
                              </div>
                              <ChevronDown
                                size={12}
                                className="text-[#c8f04b] transition-transform duration-200"
                                style={{ transform: expandedMessages.has(message.id) ? "rotate(0deg)" : "rotate(-90deg)" }}
                              />
                            </button>
                            {expandedMessages.has(message.id) && (
                              <div className="px-3 pb-3 pt-0 border-t border-[rgba(200,240,75,0.1)] space-y-1">
                                {Object.keys(message.files).map((fp) => (
                                  <div key={fp} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-[rgba(200,240,75,0.06)] transition-colors">
                                    <FileCode2 size={11} className="text-[#c8f04b] flex-shrink-0" />
                                    <span className="text-[11px] text-white/60 truncate">{fp}</span>
                                    {message.mergeStrategy?.[fp] === "append" && (
                                      <span className="text-[9px] px-[6px] py-[2px] rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 whitespace-nowrap flex-shrink-0">
                                        appended
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {message.todos && message.todos.length > 0 && (
                          <div className="bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.2)] rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                              <ListTodo size={12} className="text-purple-400" />
                              <span className="text-[11px] font-medium text-purple-400">
                                {message.todos.length} task{message.todos.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            {message.todos.map((todo) => {
                              const ps = getPriorityStyle(todo.priority)
                              return (
                                <div key={todo.id} className="bg-[#080a0e] rounded-lg p-3 border border-white/7 space-y-1">
                                  <div className="flex items-start gap-2">
                                    {todo.completed
                                      ? <CheckCircle size={12} className="text-[#c8f04b] mt-[2px] flex-shrink-0" />
                                      : <Circle size={12} className="text-white/25 mt-[2px] flex-shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap mb-[3px]">
                                        <span className="text-[12px] font-medium text-[#f0f2f5]">{todo.title}</span>
                                        <span
                                          className="text-[9px] px-[6px] py-[2px] rounded-full border font-medium uppercase tracking-wide"
                                          style={{ color: ps.color, background: ps.background, borderColor: ps.border }}
                                        >
                                          {todo.priority}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-white/35 leading-relaxed">{todo.description}</p>
                                      {(todo.tags ?? []).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-[6px]">
                                          {(todo.tags ?? []).map((tag, i) => (
                                            <span key={i} className="text-[9px] px-[6px] py-[2px] rounded-full bg-white/5 text-white/35">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Clarification */}
              {message.type === "clarification" && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertCircle size={10} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    {message.content && (
                      <div className="bg-blue-500/8 border border-blue-500/20 px-3 py-2 rounded-xl">
                        <p className="text-[12px] text-white/70 whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    )}
                    {message.questions && message.questions.length > 0 && (
                      <div className="space-y-3 bg-[#0f1117] rounded-xl p-3 border border-white/7">
                        {message.questions.map((q, idx) => (
                          <div key={q.id} className="space-y-[6px]">
                            <p className="text-[11px] font-medium text-[#f0f2f5] flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-[1px]">
                                {idx + 1}
                              </span>
                              <span>{q.label}{q.required && <span className="text-red-400 ml-1">*</span>}</span>
                            </p>

                            {q.type === "single-select" && (
                              <select
                                value={clarificationAnswers[q.id] || ""}
                                onChange={(e) => setClarificationAnswers({ ...clarificationAnswers, [q.id]: e.target.value })}
                                className="w-full px-3 py-2 text-[12px] rounded-lg bg-[#080a0e] border border-white/7 text-[#f0f2f5] outline-none focus:border-[#c8f04b]/40 transition-all"
                                style={MONO}
                              >
                                <option value="">Select an option…</option>
                                {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            )}

                            {q.type === "multi-select" && (
                              <div className="grid grid-cols-2 gap-1">
                                {q.options?.map((o) => {
                                  const checked = (clarificationAnswers[q.id] || "").split(",").includes(o)
                                  return (
                                    <label
                                      key={o}
                                      className={`flex items-center gap-2 px-2 py-[7px] rounded-lg border cursor-pointer transition-all text-[11px] ${checked
                                          ? "bg-[rgba(200,240,75,0.08)] border-[rgba(200,240,75,0.2)] text-[#c8f04b]"
                                          : "bg-[#080a0e] border-white/7 text-white/50 hover:border-white/15"
                                        }`}
                                    >
                                      <input
                                        type="checkbox" value={o} checked={checked}
                                        onChange={(e) => {
                                          const cur = (clarificationAnswers[q.id] || "").split(",").filter(Boolean)
                                          e.target.checked ? cur.push(o) : cur.splice(cur.indexOf(o), 1)
                                          setClarificationAnswers({ ...clarificationAnswers, [q.id]: cur.join(",") })
                                        }}
                                        className="w-3 h-3 accent-[#c8f04b]"
                                      />
                                      {o}
                                    </label>
                                  )
                                })}
                              </div>
                            )}

                            {(q.type === "text") && (
                              <input
                                type="text"
                                value={clarificationAnswers[q.id] || ""}
                                onChange={(e) => setClarificationAnswers({ ...clarificationAnswers, [q.id]: e.target.value })}
                                placeholder={q.placeholder || "Enter your answer…"}
                                className="w-full px-3 py-2 text-[12px] rounded-lg bg-[#080a0e] border border-white/7 text-[#f0f2f5] outline-none focus:border-[#c8f04b]/40 placeholder:text-white/20 transition-all"
                                style={MONO}
                              />
                            )}

                            {(q.type === "textarea") && (
                              <textarea
                                value={clarificationAnswers[q.id] || ""}
                                onChange={(e) => setClarificationAnswers({ ...clarificationAnswers, [q.id]: e.target.value })}
                                placeholder={q.placeholder || "Enter your answer…"}
                                className="w-full min-h-[70px] px-3 py-2 text-[12px] rounded-lg bg-[#080a0e] border border-white/7 text-[#f0f2f5] outline-none focus:border-[#c8f04b]/40 placeholder:text-white/20 resize-none transition-all"
                                style={MONO}
                              />
                            )}
                          </div>
                        ))}

                        <button
                          onClick={handleSubmitClarification}
                          disabled={isLoading || message.questions!.some((q) => q.required && !clarificationAnswers[q.id]?.trim())}
                          className="w-full mt-1 inline-flex items-center justify-center gap-2 py-[9px] rounded-lg text-[11px] font-medium bg-[rgba(200,240,75,0.1)] border border-[rgba(200,240,75,0.2)] text-[#c8f04b] hover:bg-[rgba(200,240,75,0.18)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          style={MONO}
                        >
                          <Send size={11} />
                          {isLoading ? "Processing…" : "Submit Answers"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={historyEndRef} />
      </div>

      {/* ── Input area ── */}
      <div className="border-t border-white/7 p-3 space-y-2 flex-shrink-0">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to build…"
          disabled={isLoading}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleGenerate() }}
          className="w-full min-h-[80px] px-3 py-[10px] text-[12px] rounded-xl bg-[#0f1117] border border-white/7 text-[#f0f2f5] resize-none outline-none focus:border-[#c8f04b]/40 focus:shadow-[0_0_0_3px_rgba(200,240,75,0.06)] placeholder:text-white/20 transition-all disabled:opacity-40"
          style={MONO}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center gap-2 py-[10px] rounded-xl text-[12px] font-medium bg-[#c8f04b] text-[#080a0e] hover:bg-[#d9ff5c] hover:shadow-[0_0_16px_rgba(200,240,75,0.25)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          style={MONO}
        >
          {isLoading
            ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
            : <><Sparkles size={13} /> Generate Code</>}
        </button>
      </div>
    </div>
  )
}