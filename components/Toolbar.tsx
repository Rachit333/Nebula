"use client";
import React from "react";
import { useProjectStore } from "@/hooks/useProjectStore";
import {
  Pencil, Trash2, ChevronDown,
  FilePlus, FolderPlus, Settings, Download,
  Upload, X, AlertTriangle, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG      = "#f5f5f3"
const SURFACE = "#ffffff"
const BORDER  = "#e3e3e0"
const BRHOVER = "#c8c8c4"
const TEXT    = "#1a1a1a"
const SUB     = "#6b6b6b"
const MUTED   = "#a8a8a4"
const DANGER  = "#c0392b"
const SANS: React.CSSProperties = { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }
const MONO: React.CSSProperties = { fontFamily: "'Geist Mono', 'DM Mono', monospace" }

// ── File badges ───────────────────────────────────────────────────────────────
const EXT: Record<string, { label: string; color: string; bg: string; border: string }> = {
  js:   { label: "JS",   color: "#92610a", bg: "rgba(146,97,10,0.08)",  border: "rgba(146,97,10,0.18)"  },
  jsx:  { label: "JSX",  color: "#92610a", bg: "rgba(146,97,10,0.08)",  border: "rgba(146,97,10,0.18)"  },
  ts:   { label: "TS",   color: "#1d5fa6", bg: "rgba(29,95,166,0.08)",  border: "rgba(29,95,166,0.18)"  },
  tsx:  { label: "TSX",  color: "#1d5fa6", bg: "rgba(29,95,166,0.08)",  border: "rgba(29,95,166,0.18)"  },
  css:  { label: "CSS",  color: "#1a6b8a", bg: "rgba(26,107,138,0.08)", border: "rgba(26,107,138,0.18)" },
  scss: { label: "SCSS", color: "#8a2060", bg: "rgba(138,32,96,0.08)",  border: "rgba(138,32,96,0.18)"  },
  html: { label: "</>",  color: "#8a3a10", bg: "rgba(138,58,16,0.08)",  border: "rgba(138,58,16,0.18)"  },
  json: { label: "{}",   color: "#6b6b10", bg: "rgba(107,107,16,0.08)", border: "rgba(107,107,16,0.18)" },
  md:   { label: "MD",   color: MUTED,     bg: "rgba(168,168,164,0.10)",border: "rgba(168,168,164,0.20)"},
  yaml: { label: "YML",  color: "#8a2020", bg: "rgba(138,32,32,0.08)",  border: "rgba(138,32,32,0.18)"  },
  yml:  { label: "YML",  color: "#8a2020", bg: "rgba(138,32,32,0.08)",  border: "rgba(138,32,32,0.18)"  },
}

function FileBadge({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  const b = EXT[ext] ?? { label: ext.toUpperCase().slice(0, 3) || "F", color: MUTED, bg: "rgba(168,168,164,0.08)", border: "rgba(168,168,164,0.18)" }
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4, border: `1px solid ${b.border}`, color: b.color, background: b.bg, flexShrink: 0, lineHeight: 1, ...MONO }}>
      {b.label}
    </span>
  )
}

// ── Tree ──────────────────────────────────────────────────────────────────────
type TreeNode = { type: "file"; name: string; path: string } | { type: "folder"; name: string; path: string; children: TreeNode[] }

function buildTree(files: Record<string, string>): TreeNode[] {
  const root: TreeNode = { type: "folder", name: "my-app", path: "/", children: [] }
  Object.keys(files).sort().forEach((fullPath) => {
    const parts = fullPath.split("/").filter(Boolean)
    let cur: any = root; let acc = ""
    parts.forEach((part, idx) => {
      acc += `/${part}`
      if (idx === parts.length - 1) { cur.children.push({ type: "file", name: part, path: fullPath }) }
      else {
        let next = cur.children.find((c: any) => c.type === "folder" && c.name === part)
        if (!next) { next = { type: "folder", name: part, path: acc, children: [] }; cur.children.push(next) }
        cur = next
      }
    })
  })
  function sort(n: TreeNode) {
    if (n.type === "file") return
    n.children.sort((a, b) => a.type !== b.type ? (a.type === "folder" ? -1 : 1) : a.name.localeCompare(b.name))
    n.children.forEach(sort)
  }
  sort(root); return [root]
}

// ── Rename input ──────────────────────────────────────────────────────────────
function RenameInput({ value, onCommit, onCancel }: { value: string; onCommit: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = React.useState(value)
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => { ref.current?.focus(); ref.current?.select() }, [])
  return (
    <input ref={ref} value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onCommit(v)}
      onKeyDown={(e) => { if (e.key === "Enter") onCommit(v); if (e.key === "Escape") onCancel() }}
      onClick={(e) => e.stopPropagation()}
      style={{ flex: 1, minWidth: 0, background: SURFACE, border: `1px solid ${BRHOVER}`, borderRadius: 4, padding: "2px 6px", fontSize: 12, color: TEXT, outline: "none", boxShadow: `0 0 0 2px rgba(26,26,26,0.06)`, ...MONO }}
    />
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ title, description, onConfirm, onCancel }: { title: string; description: React.ReactNode; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(245,245,243,0.75)", backdropFilter: "blur(6px)" }} onClick={onCancel} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 6 }} transition={{ duration: 0.16 }}
        style={{ position: "relative", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, width: "100%", maxWidth: 360, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
      >
        <div style={{ height: 3, background: `linear-gradient(90deg, ${DANGER}, rgba(192,57,43,0.15))` }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={14} style={{ color: DANGER }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: TEXT, letterSpacing: "-0.01em", ...SANS }}>{title}</div>
              <div style={{ fontSize: 11, color: SUB, marginTop: 3, lineHeight: 1.5, ...MONO }}>{description}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn onClick={onCancel}>Cancel</Btn>
            <Btn onClick={onConfirm} danger>Delete</Btn>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Create modal ──────────────────────────────────────────────────────────────
function CreateModal({ type, parentPath, onClose, onOpen }: { type: "file" | "folder"; parentPath: string; onClose: () => void; onOpen?: (p: string) => void }) {
  const [name, setName] = React.useState(""); const [error, setError] = React.useState("")
  const files = useProjectStore((s) => s.files)
  function handleCreate() {
    if (!name.trim()) { setError(`${type === "file" ? "File" : "Folder"} name is required`); return }
    if (/[<>:"|?*\\/]/.test(name)) { setError("Invalid characters in name"); return }
    if (type === "file") {
      const fn = name.includes(".") ? name : name + ".js"
      const fp = parentPath === "/" ? `/${fn}` : `${parentPath}/${fn}`
      if (files[fp]) { setError(`${fn} already exists`); return }
      useProjectStore.getState().setFile(fp, ""); onOpen?.(fp)
    } else {
      const fp = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`
      useProjectStore.getState().setFile(`${fp}/index.js`, "export default function() { return null; }"); onOpen?.(`${fp}/index.js`)
    }
    onClose()
  }
  const Icon = type === "file" ? FilePlus : FolderPlus
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(245,245,243,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 6 }} transition={{ duration: 0.16 }}
        style={{ position: "relative", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, width: "100%", maxWidth: 380, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
      >
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEXT}, rgba(26,26,26,0.12))` }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: TEXT, letterSpacing: "-0.01em", ...SANS }}>New {type === "file" ? "File" : "Folder"}</span>
            <IconBtn onClick={onClose}><X size={12} /></IconBtn>
          </div>
          <label style={{ display: "block", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, marginBottom: 6, ...MONO }}>
            {type === "file" ? "File name" : "Folder name"}
          </label>
          <input autoFocus placeholder={type === "file" ? "component.tsx" : "components"} value={name}
            onChange={(e) => { setName(e.target.value); setError("") }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            style={{ width: "100%", boxSizing: "border-box", background: BG, border: `1px solid ${error ? "rgba(192,57,43,0.4)" : BORDER}`, borderRadius: 7, padding: "8px 11px", fontSize: 12, color: TEXT, outline: "none", ...MONO }}
            onFocus={(e) => { e.currentTarget.style.borderColor = BRHOVER; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,26,26,0.06)" }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = error ? "rgba(192,57,43,0.4)" : BORDER; e.currentTarget.style.boxShadow = "none" }}
          />
          <p style={{ fontSize: 10, color: error ? DANGER : MUTED, marginTop: 5, ...MONO }}>{error || (type === "file" ? "Extension added automatically if omitted" : "An index.js will be created inside")}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn onClick={handleCreate} primary><Icon size={11} /> Create</Btn>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Context menu ──────────────────────────────────────────────────────────────
function CtxMenu({ x, y, items, onClose }: { x: number; y: number; items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[]; onClose: () => void }) {
  React.useEffect(() => { const h = () => onClose(); window.addEventListener("mousedown", h); return () => window.removeEventListener("mousedown", h) }, [onClose])
  return (
    <div style={{ position: "fixed", zIndex: 300, top: y, left: x, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, paddingBlock: 4, boxShadow: "0 6px 24px rgba(0,0,0,0.10)", minWidth: 156 }} onMouseDown={(e) => e.stopPropagation()}>
      {items.map((item, i) => (
        <button key={i} onClick={() => { item.onClick(); onClose() }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", fontSize: 11, background: "transparent", border: "none", color: item.danger ? DANGER : SUB, cursor: "pointer", ...MONO }}
          onMouseOver={(e) => { e.currentTarget.style.background = item.danger ? "rgba(192,57,43,0.06)" : BG; if (!item.danger) e.currentTarget.style.color = TEXT }}
          onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = item.danger ? DANGER : SUB }}
        >
          {item.icon}{item.label}
        </button>
      ))}
    </div>
  )
}

// ── Shared mini button primitives ─────────────────────────────────────────────
function Btn({ children, onClick, primary, danger }: { children: React.ReactNode; onClick: () => void; primary?: boolean; danger?: boolean }) {
  const base: React.CSSProperties = { fontSize: 11, padding: "7px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "transparent", color: SUB, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.12s", ...MONO }
  const style: React.CSSProperties = primary ? { ...base, background: TEXT, border: `1px solid ${TEXT}`, color: "#fff" } : danger ? { ...base, background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.2)", color: DANGER } : base
  return (
    <button style={style} onClick={onClick}
      onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.82" }}
      onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
    >{children}</button>
  )
}
function IconBtn({ children, onClick, title, active }: { children: React.ReactNode; onClick?: () => void; title?: string; active?: boolean }) {
  return (
    <button title={title} onClick={onClick}
      style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: active ? BG : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: active ? TEXT : MUTED, cursor: "pointer", transition: "all 0.12s", flexShrink: 0 }}
      onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = BG; (e.currentTarget as HTMLElement).style.color = TEXT }}
      onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = active ? BG : "transparent"; (e.currentTarget as HTMLElement).style.color = active ? TEXT : MUTED }}
    >{children}</button>
  )
}

// ── NodeView ──────────────────────────────────────────────────────────────────
function NodeView({ node, depth, activeFile, onOpen, onRename, onDelete }: { node: TreeNode; depth: number; activeFile?: string; onOpen?: (p: string) => void; onRename?: (o: string, n: string) => void; onDelete?: (p: string) => void }) {
  const [open, setOpen] = React.useState(depth === 0)
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [showDelete, setShowDelete] = React.useState(false)
  const [showCreate, setShowCreate] = React.useState<"file"|"folder"|null>(null)
  const [ctx, setCtx] = React.useState<{cx:number;cy:number}|null>(null)

  function handleRename(newName: string) {
    setIsRenaming(false)
    if (!newName.trim() || newName === node.name) return
    if (node.type === "file") { onRename?.(node.path, node.path.replace(/[^/]+$/, newName)) }
    else {
      const dir = node.path.substring(0, node.path.lastIndexOf("/"))
      const newPath = dir === "" ? `/${newName}` : `${dir}/${newName}`
      useProjectStore.getState().renameFolder(node.path, newPath); onRename?.(node.path, newPath)
    }
  }

  const isActive = node.type === "file" && activeFile === node.path
  const indent   = depth * 14 + 8

  const fileCtxItems   = [{ label: "Rename", icon: <Pencil size={11} />, onClick: () => setIsRenaming(true) }, { label: "Delete", icon: <Trash2 size={11} />, onClick: () => setShowDelete(true), danger: true }]
  const folderCtxItems = [{ label: "New File", icon: <FilePlus size={11} />, onClick: () => setShowCreate("file") }, { label: "New Folder", icon: <FolderPlus size={11} />, onClick: () => setShowCreate("folder") }, { label: "Rename", icon: <Pencil size={11} />, onClick: () => setIsRenaming(true) }, { label: "Delete", icon: <Trash2 size={11} />, onClick: () => setShowDelete(true), danger: true }]

  const row = (
    <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.1 }}
      style={{ paddingLeft: indent, paddingRight: 8, paddingBlock: 4, display: "flex", alignItems: "center", gap: 6, borderRadius: 6, cursor: "pointer", fontSize: 12, userSelect: "none", background: isActive ? BORDER : "transparent", color: isActive ? TEXT : SUB, transition: "background 0.1s, color 0.1s", ...MONO }}
      onMouseOver={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = BG; (e.currentTarget as HTMLElement).style.color = TEXT } }}
      onMouseOut={(e)  => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = SUB } }}
      onContextMenu={(e) => { e.preventDefault(); setCtx({ cx: e.clientX, cy: e.clientY }) }}
      onClick={() => { if (isRenaming) return; if (node.type === "file") onOpen?.(node.path); else setOpen((s) => !s) }}
    >
      {node.type === "folder"
        ? <span style={{ color: MUTED, flexShrink: 0, display: "flex", transition: "transform 0.15s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}><ChevronDown size={12} /></span>
        : <FileBadge name={node.name} />
      }
      {isRenaming
        ? <RenameInput value={node.name} onCommit={handleRename} onCancel={() => setIsRenaming(false)} />
        : <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: node.type === "folder" ? 500 : 400 }}>{node.name}</span>
      }
      {isActive && <span style={{ width: 5, height: 5, borderRadius: "50%", background: TEXT, flexShrink: 0 }} />}
    </motion.div>
  )

  return (
    <div style={{ position: "relative" }}>
      {row}
      <AnimatePresence>
        {ctx && <CtxMenu x={ctx.cx} y={ctx.cy} items={node.type === "file" ? fileCtxItems : folderCtxItems} onClose={() => setCtx(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDelete && (
          <ConfirmDialog title={`Delete ${node.type === "file" ? "File" : "Folder"}`}
            description={<>Delete <strong style={{ color: SUB }}>{node.name}</strong>{node.type === "folder" ? " and all its contents" : ""}? This cannot be undone.</>}
            onConfirm={() => { onDelete?.(node.path); toast.success("Deleted", { description: node.name }); setShowDelete(false) }}
            onCancel={() => setShowDelete(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCreate && node.type === "folder" && <CreateModal type={showCreate} parentPath={node.path} onClose={() => setShowCreate(null)} onOpen={onOpen} />}
      </AnimatePresence>
      {node.type === "folder" && (
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.16, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, width: 1, background: BORDER, left: depth * 14 + 14 }} />
                {(node as any).children.map((c: TreeNode, i: number) => (
                  <NodeView key={c.path || i} node={c} depth={depth + 1} activeFile={activeFile} onOpen={onOpen} onRename={onRename} onDelete={onDelete} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

// ── Project settings modal ────────────────────────────────────────────────────
function ProjectSettingsModal({ onClose }: { onClose: () => void }) {
  const saveProject  = useProjectStore((s) => s.saveProject)
  const loadProject  = useProjectStore((s) => s.loadProject)
  const listProjects = useProjectStore((s) => s.listProjects)
  const [tab, setTab]             = React.useState<"load"|"save">("load")
  const [projectId, setProjectId] = React.useState("")
  const [savedList, setSavedList] = React.useState<string[]>([])
  React.useEffect(() => { setSavedList(listProjects()) }, [listProjects])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(245,245,243,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 6 }} transition={{ duration: 0.16 }}
        style={{ position: "relative", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, width: "100%", maxWidth: 420, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
      >
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEXT}, rgba(26,26,26,0.12))` }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: TEXT, letterSpacing: "-0.01em", ...SANS }}>Project Settings</span>
            <IconBtn onClick={onClose}><X size={12} /></IconBtn>
          </div>
          {/* tab switcher */}
          <div style={{ display: "flex", gap: 3, padding: 3, background: BG, borderRadius: 9, marginBottom: 18 }}>
            {(["load","save"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: "6px 0", fontSize: 11, borderRadius: 7, border: "none", background: tab === t ? SURFACE : "transparent", color: tab === t ? TEXT : MUTED, fontWeight: tab === t ? 500 : 400, boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.07)" : "none", cursor: "pointer", textTransform: "capitalize", ...MONO }}
              >{t}</button>
            ))}
          </div>
          {tab === "load" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, ...MONO }}>Saved Projects</label>
              <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                {savedList.length === 0
                  ? <div style={{ textAlign: "center", padding: "28px 0", fontSize: 11, color: MUTED, ...MONO }}>No saved projects yet</div>
                  : savedList.map((id) => (
                    <button key={id} onClick={() => setProjectId(id)}
                      style={{ width: "100%", textAlign: "left", padding: "7px 11px", borderRadius: 7, fontSize: 12, border: `1px solid ${projectId === id ? BRHOVER : BORDER}`, background: projectId === id ? BG : "transparent", color: projectId === id ? TEXT : SUB, cursor: "pointer", ...MONO }}
                      onMouseOver={(e) => { if (projectId !== id) (e.currentTarget as HTMLElement).style.background = BG }}
                      onMouseOut={(e)  => { if (projectId !== id) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                    >{id}</button>
                  ))
                }
              </div>
              <Btn primary={!!projectId} onClick={() => { if (!projectId) return; loadProject(projectId); toast.success("Project loaded"); onClose() }}>
                <Upload size={12} /> Load Project
              </Btn>
            </div>
          )}
          {tab === "save" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, ...MONO }}>Project Name</label>
              <input autoFocus placeholder="my-project" value={projectId} onChange={(e) => setProjectId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && projectId.trim() && (() => { saveProject(projectId); toast.success("Saved"); setSavedList(listProjects()); setProjectId("") })()}
                style={{ width: "100%", boxSizing: "border-box", background: BG, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 11px", fontSize: 12, color: TEXT, outline: "none", ...MONO }}
                onFocus={(e) => { e.currentTarget.style.borderColor = BRHOVER; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,26,26,0.06)" }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none" }}
              />
              <Btn primary={!!projectId.trim()} onClick={() => { if (!projectId.trim()) return; saveProject(projectId); toast.success("Saved"); setSavedList(listProjects()); setProjectId("") }}>
                <Download size={12} /> Save Project
              </Btn>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Toolbar export ────────────────────────────────────────────────────────────
export default function Toolbar({ activeFile, onOpen, onRename, onDelete }: { activeFile?: string; onOpen?: (path: string) => void; onRename?: (o: string, n: string) => void; onDelete?: (p: string) => void }) {
  const files = useProjectStore((s) => s.files)
  const tree  = React.useMemo(() => buildTree(files), [files])
  const [showSettings, setShowSettings] = React.useState(false)
  const [collapsed, setCollapsed]       = React.useState(false)

  return (
    <>
      {/* Collapsed rail */}
      <AnimatePresence>
        {collapsed && (
          <motion.div key="rail" initial={{ width: 0, opacity: 0 }} animate={{ width: 36, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.18, ease: "easeInOut" }}
            style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: BG, borderRight: `1px solid ${BORDER}`, overflow: "hidden", flexShrink: 0 }}
          >
            <div style={{ marginTop: 10 }}>
              <IconBtn onClick={() => setCollapsed(false)} title="Show Explorer"><PanelLeftOpen size={13} /></IconBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full panel */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div key="panel" initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.18, ease: "easeInOut" }}
            style={{ height: "100%", display: "flex", flexDirection: "column", background: BG, borderRight: `1px solid ${BORDER}`, overflow: "hidden", minWidth: 0, flexShrink: 0 }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", height: 40, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.10em", textTransform: "uppercase", color: MUTED, fontWeight: 500, ...MONO }}>Explorer</span>
              <div style={{ display: "flex", gap: 2 }}>
                <IconBtn onClick={() => setShowSettings(true)} title="Settings"><Settings size={12} /></IconBtn>
                <IconBtn onClick={() => setCollapsed(true)} title="Hide Explorer"><PanelLeftClose size={12} /></IconBtn>
              </div>
            </div>
            {/* Tree */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 4px" }}>
              {tree.map((n, i) => (
                <NodeView key={(n as any).path || i} node={n} depth={0} activeFile={activeFile} onOpen={onOpen} onRename={onRename} onDelete={onDelete} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <ProjectSettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </>
  )
}