"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useAICodeGeneration } from "@/hooks/useAICodeGeneration"
import { Loader2, Sparkles, AlertCircle, CheckCircle2, FileCode2, Trash2, Send, MessageSquarePlus, ListTodo, Circle, CheckCircle, ChevronDown, X, ArrowUp } from "lucide-react"

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG      = "#f5f5f3"
const SURFACE = "#ffffff"
const BORDER  = "#e3e3e0"
const BRHOVER = "#c8c8c4"
const TEXT    = "#1a1a1a"
const SUB     = "#6b6b6b"
const MUTED   = "#a8a8a4"
const SANS: React.CSSProperties = { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }
const MONO: React.CSSProperties = { fontFamily: "'Geist Mono', 'DM Mono', monospace" }

interface Todo { id: string; title: string; description: string; priority: "high"|"medium"|"low"; tags: string[]; completed: boolean }
interface ClarificationQuestion { id: string; label: string; type: "text"|"textarea"|"single-select"|"multi-select"; required?: boolean; placeholder?: string; options?: string[] }
interface ChatMessage { id: string; type: "prompt"|"response"|"clarification"; content: string; error?: string; files?: Record<string,string>; mergeStrategy?: Record<string,string>; todos?: Todo[]; questions?: ClarificationQuestion[] }

function priorityStyle(p: string) {
  if (p === "high")   return { color: "#b94040", bg: "#fdf0f0", border: "#f0c8c8" }
  if (p === "medium") return { color: "#8a5c10", bg: "#fdf6ea", border: "#e8d4a0" }
  return                     { color: "#1d5fa6", bg: "#eef4fb", border: "#bfd4ee" }
}

export default function AICodeGenerator({ onClose }: { onClose?: () => void }) {
  const [prompt, setPrompt] = useState("")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { isLoading, chatHistory, generateCode, clearHistory } = useAICodeGeneration()
  const endRef            = useRef<HTMLDivElement>(null)
  const textareaRef       = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chatHistory])
  useEffect(() => { setTimeout(() => textareaRef.current?.focus(), 80) }, [])

  function growTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  async function handleGenerate() {
    if (!prompt.trim() || isLoading) return
    await generateCode({ prompt }); setPrompt("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  async function handleSubmitClarification() {
    const a = Object.entries(answers).map(([k,v]) => `${k}: ${v}`).join("\n")
    if (!a.trim()) return
    await generateCode({ prompt: a }); setAnswers({})
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate() }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG, borderRight: `1px solid ${BORDER}`, ...SANS }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 40, padding: "0 14px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, letterSpacing: "-0.01em" }}>Ask AI</span>
        <div style={{ display: "flex", gap: 2 }}>
          {chatHistory.length > 0 && (
            <IconBtn onClick={clearHistory} title="Clear"><Trash2 size={12} /></IconBtn>
          )}
          {onClose && <IconBtn onClick={onClose} title="Close"><X size={12} /></IconBtn>}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "14px 0 6px" }}
      >
        {chatHistory.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 24px", height: "100%" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: BORDER, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <MessageSquarePlus size={18} style={{ color: MUTED }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 5, letterSpacing: "-0.01em" }}>Ask Nebula Anything</p>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.55, maxWidth: 180 }}>Describe what you want to build and AI will write the code.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {chatHistory.map((msg) => (
              <div key={msg.id}>

                {/* User */}
                {msg.type === "prompt" && (
                  <div style={{ padding: "0 14px", display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: TEXT, borderRadius: "12px 12px 3px 12px", padding: "8px 12px", fontSize: 12, lineHeight: 1.55, color: "#fff", maxWidth: "88%", ...MONO }}>
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* AI */}
                {msg.type === "response" && (
                  <div style={{ padding: "0 14px" }}>
                    {msg.error ? (
                      <div style={{ background: "#fdf0f0", border: "1px solid #f0c8c8", borderRadius: 9, padding: "9px 11px", display: "flex", gap: 7 }}>
                        <AlertCircle size={11} style={{ color: "#b94040", marginTop: 1, flexShrink: 0 }} />
                        <p style={{ fontSize: 11, color: "#b94040", lineHeight: 1.5 }}>{msg.error}</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {msg.content && (
                          <div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: MUTED, marginBottom: 4 }}>
                              <Sparkles size={9} /><span style={MONO}>Thought</span>
                            </div>
                            <p style={{ fontSize: 12, color: SUB, lineHeight: 1.6 }}>{msg.content}</p>
                          </div>
                        )}

                        {msg.files && Object.keys(msg.files).length > 0 && (
                          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 9, overflow: "hidden", background: SURFACE }}>
                            <button onClick={() => toggleExpanded(msg.id)}
                              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 11px", background: "transparent", border: "none", cursor: "pointer" }}
                              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = BG }}
                              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <CheckCircle2 size={11} style={{ color: "#2d7a2d" }} />
                                <span style={{ fontSize: 11, fontWeight: 500, color: TEXT, ...SANS }}>Changed {Object.keys(msg.files).length} file{Object.keys(msg.files).length !== 1 ? "s" : ""}</span>
                              </div>
                              <ChevronDown size={11} style={{ color: MUTED, transform: expanded.has(msg.id) ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
                            </button>
                            {expanded.has(msg.id) && (
                              <div style={{ borderTop: `1px solid ${BORDER}`, padding: "4px 0" }}>
                                {Object.keys(msg.files).map((fp) => (
                                  <div key={fp} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 11px" }}
                                    onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = BG }}
                                    onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                                  >
                                    <FileCode2 size={10} style={{ color: MUTED, flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: SUB, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...MONO }}>{fp}</span>
                                    {msg.mergeStrategy?.[fp] === "append" && (
                                      <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 99, background: "#eef4fb", border: "1px solid #bfd4ee", color: "#1d5fa6", flexShrink: 0 }}>+</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {msg.todos && msg.todos.length > 0 && (
                          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 9, overflow: "hidden", background: SURFACE }}>
                            <div style={{ padding: "7px 11px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 5 }}>
                              <ListTodo size={11} style={{ color: MUTED }} />
                              <span style={{ fontSize: 11, fontWeight: 500, color: TEXT, ...SANS }}>{msg.todos.length} task{msg.todos.length !== 1 ? "s" : ""}</span>
                            </div>
                            {msg.todos.map((todo) => {
                              const ps = priorityStyle(todo.priority)
                              return (
                                <div key={todo.id} style={{ padding: "7px 11px", borderBottom: `1px solid ${BORDER}` }}
                                  onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = BG }}
                                  onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                                >
                                  <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                                    {todo.completed ? <CheckCircle size={11} style={{ color: "#2d7a2d", marginTop: 1, flexShrink: 0 }} /> : <Circle size={11} style={{ color: BORDER, marginTop: 1, flexShrink: 0 }} />}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 2 }}>
                                        <span style={{ fontSize: 11, fontWeight: 500, color: TEXT }}>{todo.title}</span>
                                        <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 99, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: ps.color, background: ps.bg, border: `1px solid ${ps.border}` }}>{todo.priority}</span>
                                      </div>
                                      <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>{todo.description}</p>
                                      {(todo.tags ?? []).length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
                                          {(todo.tags ?? []).map((tag, i) => <span key={i} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 99, background: BG, color: SUB }}>{tag}</span>)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Clarification */}
                {msg.type === "clarification" && (
                  <div style={{ padding: "0 14px" }}>
                    {msg.content && <p style={{ fontSize: 12, color: SUB, lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-wrap" }}>{msg.content}</p>}
                    {msg.questions && msg.questions.length > 0 && (
                      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 9, background: SURFACE, overflow: "hidden" }}>
                        <div style={{ padding: "10px 11px", display: "flex", flexDirection: "column", gap: 10 }}>
                          {msg.questions.map((q, idx) => (
                            <div key={q.id}>
                              <p style={{ fontSize: 11, fontWeight: 500, color: TEXT, marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}>
                                <span style={{ width: 15, height: 15, borderRadius: "50%", background: BG, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: MUTED, flexShrink: 0, ...MONO }}>{idx + 1}</span>
                                <span>{q.label}{q.required && <span style={{ color: "#b94040", marginLeft: 2 }}>*</span>}</span>
                              </p>
                              {q.type === "single-select" && (
                                <select value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                  style={{ width: "100%", padding: "6px 9px", fontSize: 11, borderRadius: 7, background: BG, border: `1px solid ${BORDER}`, color: TEXT, outline: "none", ...MONO }}>
                                  <option value="">Select…</option>
                                  {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              )}
                              {q.type === "multi-select" && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                                  {q.options?.map((o) => {
                                    const checked = (answers[q.id] || "").split(",").includes(o)
                                    return (
                                      <label key={o} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 7px", borderRadius: 7, cursor: "pointer", border: `1px solid ${checked ? BRHOVER : BORDER}`, background: checked ? BORDER : BG, fontSize: 11, color: SUB }}>
                                        <input type="checkbox" value={o} checked={checked}
                                          onChange={(e) => { const cur = (answers[q.id] || "").split(",").filter(Boolean); e.target.checked ? cur.push(o) : cur.splice(cur.indexOf(o), 1); setAnswers({ ...answers, [q.id]: cur.join(",") }) }}
                                          style={{ width: 11, height: 11, accentColor: TEXT }} />
                                        {o}
                                      </label>
                                    )
                                  })}
                                </div>
                              )}
                              {q.type === "text" && (
                                <input type="text" value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder={q.placeholder || "Answer…"}
                                  style={{ width: "100%", padding: "6px 9px", fontSize: 11, borderRadius: 7, background: BG, border: `1px solid ${BORDER}`, color: TEXT, outline: "none", boxSizing: "border-box", ...MONO }} />
                              )}
                              {q.type === "textarea" && (
                                <textarea value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder={q.placeholder || "Answer…"}
                                  style={{ width: "100%", minHeight: 60, padding: "6px 9px", fontSize: 11, borderRadius: 7, background: BG, border: `1px solid ${BORDER}`, color: TEXT, outline: "none", resize: "none", boxSizing: "border-box", ...MONO }} />
                              )}
                            </div>
                          ))}
                          <button onClick={handleSubmitClarification} disabled={isLoading || msg.questions!.some((q) => q.required && !answers[q.id]?.trim())}
                            style={{ width: "100%", padding: "7px 11px", borderRadius: 7, background: TEXT, color: "#fff", fontSize: 11, fontWeight: 500, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", opacity: isLoading || msg.questions!.some((q) => q.required && !answers[q.id]?.trim()) ? 0.35 : 1, transition: "opacity 0.15s", ...SANS }}>
                            <Send size={10} />{isLoading ? "Processing…" : "Submit"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div style={{ height: 8 }} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 12px 12px", background: BG, flexShrink: 0 }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden", transition: "border-color 0.15s, box-shadow 0.15s" }}
          onFocusCapture={(e) => { e.currentTarget.style.borderColor = BRHOVER; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08), 0 0 0 3px rgba(26,26,26,0.05)" }}
          onBlurCapture={(e)  => { e.currentTarget.style.borderColor = BORDER;  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)" }}
        >
          <textarea ref={textareaRef} value={prompt} onChange={growTextarea} onKeyDown={handleKeyDown}
            placeholder="Ask Nebula Anything…" disabled={isLoading} rows={1}
            style={{ width: "100%", padding: "10px 12px 4px", fontSize: 12, lineHeight: 1.55, color: TEXT, background: "transparent", border: "none", outline: "none", resize: "none", display: "block", boxSizing: "border-box", minHeight: 36, maxHeight: 160, ...MONO }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 8px" }}>
            <span style={{ fontSize: 10, color: MUTED, userSelect: "none", ...MONO }}>↵ send · ⇧↵ newline</span>
            <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}
              style={{ width: 26, height: 26, borderRadius: 7, background: prompt.trim() && !isLoading ? TEXT : BORDER, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: prompt.trim() && !isLoading ? "pointer" : "default", transition: "background 0.15s", flexShrink: 0 }}>
              {isLoading ? <Loader2 size={12} style={{ color: MUTED, animation: "spin 1s linear infinite" }} /> : <ArrowUp size={12} style={{ color: prompt.trim() ? "#fff" : MUTED }} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shared icon button ────────────────────────────────────────────────────────
function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button title={title} onClick={onClick}
      style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, cursor: "pointer", transition: "all 0.12s", flexShrink: 0 }}
      onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = BORDER; (e.currentTarget as HTMLElement).style.color = TEXT }}
      onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = MUTED }}
    >{children}</button>
  )
}