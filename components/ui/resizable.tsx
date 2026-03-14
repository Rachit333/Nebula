"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"

// ── Design tokens ─────────────────────────────────────────────────────────────
const BORDER  = "#e3e3e0"
const BRHOVER = "#c8c8c4"
const MUTED   = "#a8a8a4"
const TEXT    = "#1a1a1a"
const BG      = "#f5f5f3"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & { withHandle?: boolean }) {

  const elRef = React.useRef<HTMLDivElement>(null)

  // Attach imperative hover/active listeners to avoid TS currentTarget cast issues
  React.useEffect(() => {
    const el = elRef.current
    if (!el) return
    const over  = () => { el.style.backgroundColor = BRHOVER }
    const out   = () => { el.style.backgroundColor = BORDER  }
    const down  = () => { el.style.backgroundColor = TEXT    }
    const up    = () => { el.style.backgroundColor = BRHOVER }
    el.addEventListener("mouseover",  over)
    el.addEventListener("mouseout",   out)
    el.addEventListener("mousedown",  down)
    el.addEventListener("mouseup",    up)
    return () => {
      el.removeEventListener("mouseover",  over)
      el.removeEventListener("mouseout",   out)
      el.removeEventListener("mousedown",  down)
      el.removeEventListener("mouseup",    up)
    }
  }, [])

  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "group relative flex w-px select-none touch-none items-center justify-center",
        "transition-colors duration-150",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        "focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {/* The visible 1px line — controlled via the ref above */}
      <div
        ref={elRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: BORDER,
          transition: "background-color 0.15s",
        }}
      />

      {/* Wide transparent hit-area so the 1px line is easy to grab */}
      <div style={{ position: "absolute", inset: "0 -4px", background: "transparent" }} />

      {withHandle && (
        <div
          className="resizable-grip z-10 flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150 group-active:scale-95"
          style={{
            position: "relative",
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <GripVerticalIcon
            className="resizable-grip-icon size-3 transition-colors duration-150"
            style={{ color: MUTED }}
          />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

// One-time style: lift grip on parent hover
if (typeof document !== "undefined") {
  const ID = "__resizable-codex__"
  if (!document.getElementById(ID)) {
    const s = document.createElement("style")
    s.id = ID
    s.textContent = `
      [data-slot="resizable-handle"]:hover .resizable-grip {
        background: ${BG} !important;
        border-color: ${BRHOVER} !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.12) !important;
      }
      [data-slot="resizable-handle"]:hover .resizable-grip-icon { color: ${TEXT} !important; }
    `
    document.head.appendChild(s)
  }
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }