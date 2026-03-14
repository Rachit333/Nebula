"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Trash2, X } from "lucide-react";

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

// ── Derive a stable per-project hue from the name ─────────────────────────────
function projectHue(name: string): number {
  return [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
}

export function ProjectCard({ project, onDelete }: any) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [hovered, setHovered] = useState(false)

  const initials =
    project.name
      .split(/[\s\-_]/)
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() ?? "")
      .join("") || project.name[0]?.toUpperCase() || "?"

  const hue         = projectHue(project.name)
  // Muted, desaturated accent that works on a light background
  const accentColor  = `hsl(${hue}, 45%, 42%)`
  const accentBg     = `hsla(${hue}, 45%, 42%, 0.08)`
  const accentBorder = `hsla(${hue}, 45%, 42%, 0.20)`

  const isActive = project.status === "active"

  return (
    <div
      style={{
        position: "relative",
        display: "flex", flexDirection: "column", gap: 14,
        padding: 18,
        fontFamily: MONO,
        cursor: "default",
        transition: "background 0.12s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* subtle top accent line on hover */}
      <div style={{
        position: "absolute", top: 0, left: 18, right: 18, height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.2s",
      }} />

      {/* avatar + name */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: accentBg, border: `1px solid ${accentBorder}`,
          color: accentColor,
          fontSize: 12, fontWeight: 700, fontFamily: SANS,
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "transform 0.18s",
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{
            fontFamily: SANS, fontWeight: 600, fontSize: 14,
            letterSpacing: "-0.02em", color: TEXT,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}>
            {project.name}
          </div>

          {/* status */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
              background: isActive ? "#2d7a2d" : MUTED,
            }} />
            <span style={{
              fontFamily: MONO, fontSize: 9, letterSpacing: "0.10em",
              textTransform: "uppercase", color: MUTED,
            }}>
              {project.status ?? "active"}
            </span>
          </div>
        </div>
      </div>

      {/* description */}
      {project.description && (
        <p style={{
          fontFamily: MONO, fontSize: 11, lineHeight: 1.65, color: SUB,
          marginTop: -4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {project.description}
        </p>
      )}

      {/* actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 2 }}>
        {/* Open */}
        <button
          onClick={() => router.push(`/studio?project=${encodeURIComponent(project.id)}`)}
          style={{
            flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
            fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.03em",
            borderRadius: 7, padding: "7px 12px", border: `1px solid ${accentBorder}`,
            background: accentBg, color: accentColor,
            cursor: "pointer", transition: "opacity 0.12s",
          }}
          onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.75" }}
          onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
        >
          Open <ArrowUpRight size={11} />
        </button>

        {/* Delete — two-step confirm */}
        {confirming ? (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <button
              onClick={() => onDelete(project.id)}
              style={{
                fontFamily: MONO, fontSize: 10, fontWeight: 500, letterSpacing: "0.05em",
                color: "#b94040", background: "rgba(192,57,43,0.07)",
                border: "1px solid rgba(192,57,43,0.20)",
                borderRadius: 7, padding: "7px 11px",
                cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.12s",
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(192,57,43,0.13)" }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.background = "rgba(192,57,43,0.07)" }}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                width: 30, height: 30, borderRadius: 7, border: `1px solid ${BORDER}`,
                background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                color: MUTED, cursor: "pointer", transition: "all 0.12s",
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT; (e.currentTarget as HTMLElement).style.borderColor = BRHOVER }}
              onMouseOut={(e)  => { (e.currentTarget as HTMLElement).style.color = MUTED; (e.currentTarget as HTMLElement).style.borderColor = BORDER }}
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{
              width: 30, height: 30, borderRadius: 7, border: `1px solid ${BORDER}`,
              background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              color: MUTED, cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#b94040"
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(192,57,43,0.25)"
              ;(e.currentTarget as HTMLElement).style.background = "rgba(192,57,43,0.07)"
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.color = MUTED
              ;(e.currentTarget as HTMLElement).style.borderColor = BORDER
              ;(e.currentTarget as HTMLElement).style.background = "transparent"
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ProjectCard