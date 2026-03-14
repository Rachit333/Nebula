"use client"

import { useState } from "react"
import { useProjectsStore } from "@/hooks/useProjectsStore"
import { ProjectCard } from "@/components/project-card"
import { Plus, RefreshCw, X, ArrowRight, Layers } from "lucide-react"

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG      = "#f5f5f3"
const SURFACE = "#ffffff"
const BORDER  = "#e3e3e0"
const BRHOVER = "#c8c8c4"
const TEXT    = "#1a1a1a"
const SUB     = "#6b6b6b"
const MUTED   = "#a8a8a4"
const SANS    = "'Geist', 'Inter', system-ui, sans-serif"
const MONO    = "'Geist Mono', 'DM Mono', monospace"

// ── Create modal ──────────────────────────────────────────────────────────────
function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: { name: string; description: string }) => void
}) {
  const [formData, setFormData] = useState({ name: "", description: "" })

  function handleSubmit() {
    if (formData.name.trim()) onCreate(formData)
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      animation: "overlayIn 0.18s ease both",
    }}>
      {/* backdrop */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(245,245,243,0.80)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* card */}
      <div style={{
        position: "relative", background: SURFACE,
        border: `1px solid ${BORDER}`, borderRadius: 14,
        width: "100%", maxWidth: 460, overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        animation: "modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        {/* top accent */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${TEXT}, rgba(26,26,26,0.12))` }} />

        <div style={{ padding: 28 }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: TEXT }}>
                New Project
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
                Give your project a name and description.
              </div>
            </div>
            <button onClick={onClose} style={iconBtnStyle()}>
              <X size={13} />
            </button>
          </div>

          {/* fields */}
          <Field label="Project Name">
            <input
              style={inputStyle()}
              placeholder="my-awesome-project"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              onFocus={(e) => focusInput(e.currentTarget)}
              onBlur={(e)  => blurInput(e.currentTarget)}
              autoFocus
            />
          </Field>

          <Field label="Description">
            <input
              style={inputStyle()}
              placeholder="What does this project do?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              onFocus={(e) => focusInput(e.currentTarget)}
              onBlur={(e)  => blurInput(e.currentTarget)}
            />
          </Field>

          {/* footer */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 24, paddingTop: 18, borderTop: `1px solid ${BORDER}` }}>
            <button onClick={onClose} style={secondaryBtnStyle()}
              onMouseOver={(e) => hoverSecondary(e.currentTarget)}
              onMouseOut={(e)  => outSecondary(e.currentTarget)}
            >
              Cancel
            </button>
            <button onClick={handleSubmit} style={primaryBtnStyle()}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85" }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
            >
              Create Project <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: MONO, fontSize: 10, letterSpacing: "0.10em", textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Style helpers ─────────────────────────────────────────────────────────────
function inputStyle(): React.CSSProperties {
  return {
    width: "100%", boxSizing: "border-box",
    fontFamily: MONO, fontSize: 12, color: TEXT,
    background: BG, border: `1px solid ${BORDER}`, borderRadius: 8,
    padding: "9px 12px", outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  }
}
function focusInput(el: HTMLInputElement) {
  el.style.borderColor = BRHOVER
  el.style.boxShadow = "0 0 0 3px rgba(26,26,26,0.06)"
}
function blurInput(el: HTMLInputElement) {
  el.style.borderColor = BORDER
  el.style.boxShadow = "none"
}

function iconBtnStyle(): React.CSSProperties {
  return {
    width: 28, height: 28, borderRadius: 7,
    border: `1px solid ${BORDER}`, background: "transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: MUTED, cursor: "pointer", flexShrink: 0, transition: "all 0.12s",
  }
}
function primaryBtnStyle(): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: MONO, fontSize: 12, fontWeight: 500,
    color: SURFACE, background: TEXT, border: "none",
    padding: "9px 16px", borderRadius: 8, cursor: "pointer",
    transition: "opacity 0.15s", whiteSpace: "nowrap",
  }
}
function secondaryBtnStyle(): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: MONO, fontSize: 12,
    color: SUB, background: "transparent", border: `1px solid ${BORDER}`,
    padding: "9px 14px", borderRadius: 8, cursor: "pointer",
    transition: "all 0.12s", whiteSpace: "nowrap",
  }
}
function hoverSecondary(el: HTMLElement) {
  el.style.color = TEXT; el.style.borderColor = BRHOVER; el.style.background = BG
}
function outSecondary(el: HTMLElement) {
  el.style.color = SUB; el.style.borderColor = BORDER; el.style.background = "transparent"
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { projects, addProject, deleteProject, refresh } = useProjectsStore()
  const [isOpen, setIsOpen]     = useState(false)
  const [spinning, setSpinning] = useState(false)

  function handleRefresh() {
    setSpinning(true); refresh()
    setTimeout(() => setSpinning(false), 700)
  }

  function handleCreate(data: { name: string; description: string }) {
    addProject({ name: data.name, description: data.description, status: "active" })
    setIsOpen(false); refresh()
  }

  const activeCount = projects.filter((p: any) => p.status === "active").length

  return (
    <div style={{ fontFamily: MONO, background: BG, minHeight: "100vh", color: TEXT, overflowX: "hidden" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: `1px solid ${BORDER}`,
        background: "rgba(245,245,243,0.92)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, background: TEXT, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers size={14} style={{ color: BG }} />
            </div>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: TEXT }}>
              Nebula
            </span>
          </div>

          {/* actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleRefresh}
              title="Sync projects"
              style={iconBtnStyle()}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = BORDER; (e.currentTarget as HTMLElement).style.color = TEXT }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = MUTED }}
            >
              <RefreshCw size={13} style={{ animation: spinning ? "spin 0.7s linear" : "none" }} />
            </button>
            <button onClick={() => setIsOpen(true)} style={primaryBtnStyle()}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85" }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
            >
              <Plus size={13} /> New Project
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 32px 48px", animation: "fadeUp 0.5s ease both" }}>
        {/* eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
          color: SUB, background: SURFACE, border: `1px solid ${BORDER}`,
          padding: "4px 10px", borderRadius: 99, marginBottom: 24,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: TEXT }} />
          Workspace
        </div>

        <h1 style={{ fontFamily: SANS, fontWeight: 800, fontSize: "clamp(40px,5vw,68px)", lineHeight: 1.05, letterSpacing: "-0.04em", color: TEXT, marginBottom: 16 }}>
          Your<br />Projects
        </h1>

        <p style={{ fontFamily: MONO, fontSize: 13, color: MUTED, marginBottom: 32, lineHeight: 1.7, maxWidth: 400 }}>
          Manage, build, and ship. Everything you're working on, in one place.
        </p>

        {projects.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setIsOpen(true)} style={primaryBtnStyle()}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85" }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
            >
              <Plus size={13} /> New Project
            </button>
            <button onClick={handleRefresh} style={secondaryBtnStyle()}
              onMouseOver={(e) => hoverSecondary(e.currentTarget)}
              onMouseOut={(e)  => outSecondary(e.currentTarget)}
            >
              <RefreshCw size={12} /> Sync
            </button>
          </div>
        )}
      </section>

      {/* ── Stats bar ── */}
      {projects.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ height: 1, background: BORDER }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 24, padding: "14px 0" }}>
            <Stat value={projects.length} label="Projects" />
            <div style={{ width: 1, height: 18, background: BORDER }} />
            <Stat value={activeCount} label="Active" />
          </div>
          <div style={{ height: 1, background: BORDER }} />
        </div>
      )}

      {/* ── Content ── */}
      {projects.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 32px", textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: SURFACE, border: `1px solid ${BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <Layers size={32} style={{ color: MUTED }} />
          </div>
          <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: "-0.02em" }}>
            No projects yet
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: MUTED, marginBottom: 24, lineHeight: 1.7, maxWidth: 280 }}>
            Create your first project to get started. Everything you build lives here.
          </div>
          <button onClick={() => setIsOpen(true)} style={primaryBtnStyle()}
            onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85" }}
            onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
          >
            <Plus size={13} /> Create First Project
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 80px" }}>
          <div style={{
            fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em",
            textTransform: "uppercase", color: MUTED,
            marginBottom: 20, display: "flex", alignItems: "center", gap: 12,
          }}>
            All Projects
            <div style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 1,
            background: BORDER,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            overflow: "hidden",
          }}>
            {projects.map((project: any) => (
              <div
                key={project.id}
                style={{ background: SURFACE, transition: "background 0.12s" }}
                onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = BG }}
                onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = SURFACE }}
              >
                <ProjectCard project={project} onDelete={deleteProject} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {isOpen && <CreateModal onClose={() => setIsOpen(false)} onCreate={handleCreate} />}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ── Stat ──────────────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: TEXT }}>{value}</span>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED }}>{label}</span>
    </div>
  )
}